import { db } from '../database';
import { syncPush, syncPull, isOnline } from './api';
import type { OutboxItem, SyncPushRequest, SyncPullRequest, Roll, Inspection, Defect } from '../types';

// 🚀 資料變更通知回調函數
let dataChangeCallback: (() => Promise<void>) | null = null;

// 設定資料變更通知回調
export function setDataChangeCallback(callback: () => Promise<void>) {
  dataChangeCallback = callback;
}

// 生成唯一的客戶端變更 ID
function generateClientMutationId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 將資料加入 outbox
export async function addToOutbox(
  entity: 'rolls' | 'inspections' | 'defects',
  op: 'upsert' | 'delete',
  key: string,
  payload: unknown
): Promise<void> {
  const outboxItem: OutboxItem = {
    id: generateClientMutationId(),
    entity,
    op,
    key,
    payload,
    clientMutationId: generateClientMutationId(),
    createdAt: new Date().toISOString()
  };

  // 先寫入 outbox 確保不丟資料
  await db.outbox.add(outboxItem);
  console.log('Added to outbox:', outboxItem);

  // 若線上，立即嘗試推送該筆（online-first）
  if (isOnline()) {
    try {
      const result = await syncPush({ mutations: [outboxItem] });
      const ok = result?.results?.find(r => r.clientMutationId === outboxItem.clientMutationId && r.success);
      if (ok) {
        // 清理 outbox 與更新本地 _dirty 標記
        await db.outbox.where('clientMutationId').equals(outboxItem.clientMutationId).delete();
        if (ok.updated_at) {
          await updateLocalDataAfterSync(outboxItem, ok.updated_at as string);
        }
        console.log('✓ Immediate push succeeded:', outboxItem.entity, outboxItem.op);
      } else {
        const err = result?.results?.find(r => r.clientMutationId === outboxItem.clientMutationId)?.error;
        console.warn('⚠ Immediate push failed:', err || 'unknown', '- will retry later');
      }
    } catch (e: any) {
      console.warn('⚠ Immediate push error:', e?.message || e, '- will retry later');
    }
  } else {
    console.log('📴 Offline - added to outbox:', outboxItem.entity, outboxItem.op);
  }

  // 通知資料變更（觸發智能同步）
  if (dataChangeCallback) {
    void dataChangeCallback();
  }
}

// 執行同步推送
export async function performSyncPush(): Promise<{ success: boolean; synced: number; failed: number; errors: string[] }> {
  if (!isOnline()) {
    console.log('📴 Offline, skipping sync push');
    return { success: false, synced: 0, failed: 0, errors: ['網路離線'] };
  }

  try {
    // 取得所有待同步的項目
    const outboxItems = await db.outbox.toArray();
    
    if (outboxItems.length === 0) {
      console.log('✓ No items to sync');
      return { success: true, synced: 0, failed: 0, errors: [] };
    }

    const request: SyncPushRequest = {
      mutations: outboxItems
    };

    const response = await syncPush(request);
    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // 處理同步結果
    for (const result of response.results) {
      if (result.success) {
        // 同步成功，從 outbox移除
        await db.outbox.where('clientMutationId').equals(result.clientMutationId).delete();
        
        // 更新本地資料的 _dirty 標記和伺服器時間
        if (result.updated_at) {
          const outboxItem = outboxItems.find(item => item.clientMutationId === result.clientMutationId);
          if (outboxItem) {
            await updateLocalDataAfterSync(outboxItem, result.updated_at);
          }
        }
        syncedCount++;
      } else {
        console.error('Sync failed for item:', result.clientMutationId, result.error);
        failedCount++;
        if (result.error) errors.push(result.error);
      }
    }

    console.log(`✓ Sync push completed: ${syncedCount} synced, ${failedCount} failed`);
    return { success: failedCount === 0, synced: syncedCount, failed: failedCount, errors };
  } catch (error: any) {
    console.error('❌ Sync push failed:', error);
    return { success: false, synced: 0, failed: 0, errors: [error?.message || 'Unknown error'] };
  }
}

// 執行同步拉取
export async function performSyncPull(lastSyncAt?: string): Promise<boolean> {
  if (!isOnline()) {
    //離線則不會pull資料
    return false;
  }

  try {
    const request: SyncPullRequest = {
      since: lastSyncAt || '',
      take: 100
    };

    const response = await syncPull(request);

    // 合併伺服器資料到本地
    await mergeServerData(response.data);

    return true;
  } catch (error) {
    console.error('Sync pull failed:', error);
    return false;
  }
}

// 更新本地資料（同步後）
async function updateLocalDataAfterSync(outboxItem: OutboxItem, serverUpdatedAt: string): Promise<void> {
  const { entity, key, payload } = outboxItem;


  
  switch (entity) {
    case 'rolls':
      await db.rolls.update(key, {
        _dirty: false,
        updated_at: serverUpdatedAt
      });
      break;
    case 'inspections':
      await db.inspections.update(key, {
        _dirty: false,
        updated_at: serverUpdatedAt
      });
      break;
    case 'defects':
      await db.defects.update(key, {
        _dirty: false,
        updated_at: serverUpdatedAt
      });
      break;
  }
}

// 合併伺服器資料到本地
async function mergeServerData(serverData: { rolls: Roll[]; inspections: Inspection[]; defects: Defect[] }): Promise<void> {
  // 合併 rolls
  for (const serverRoll of serverData.rolls) {
    const localRoll = await db.rolls.get(serverRoll.id);
    
    if (!localRoll || !localRoll._dirty || new Date(serverRoll.updated_at) > new Date(localRoll.updated_at)) {
      // 伺服器版本較新或本地沒有，使用伺服器版本
      await db.rolls.put({ ...serverRoll, _dirty: false });
    }
  }

  // 合併 inspections
  for (const serverInspection of serverData.inspections) {
    const localInspection = await db.inspections.get(serverInspection.id);
    
    if (!localInspection || !localInspection._dirty || new Date(serverInspection.updated_at) > new Date(localInspection.updated_at)) {
      await db.inspections.put({ ...serverInspection, _dirty: false });
    }
  }

  // 合併 defects
  for (const serverDefect of serverData.defects) {
    const localDefect = await db.defects.get(serverDefect.id);
    
    if (!localDefect || !localDefect._dirty || new Date(serverDefect.updated_at) > new Date(localDefect.updated_at)) {
      await db.defects.put({ ...serverDefect, _dirty: false });
    }
  }
}

// 完整同步（推送 + 拉取）
export async function performFullSync(lastSyncAt?: string): Promise<{ pushSuccess: boolean; pullSuccess: boolean }> {
  const pushResult = await performSyncPush();
  const pullSuccess = await performSyncPull(lastSyncAt);
  
  return { pushSuccess: pushResult.success, pullSuccess };
}

// 取得待同步項目數量
export async function getPendingSyncCount(): Promise<number> {
  return await db.outbox.count();
}

// 清除所有待同步項目（緊急情況使用）
export async function clearOutbox(): Promise<void> {
  await db.outbox.clear();
  console.log('Outbox cleared');
}
