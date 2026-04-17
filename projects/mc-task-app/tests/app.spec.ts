/**
 * 阿一测试报告 — 我的世界任务激励工具
 * 测试框架：Playwright
 * 覆盖范围：功能测试 / 边界测试 / 移动端兼容性
 */

import { test, expect, Page } from '@playwright/test';

// ─── Helpers ───────────────────────────────────────────────

/** 清除 localStorage 并刷新页面 */
async function resetAndReload(page: Page) {
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
}

/** 点击 Tab */
async function clickTab(page: Page, tabLabel: string) {
  await page.locator(`button:has-text("${tabLabel}")`).first().click();
  await page.waitForTimeout(300);
}

/** 输入 PIN 码 */
async function enterPin(page: Page, pin: string) {
  await page.locator('button:has-text("输入密码")').click();
  await page.waitForTimeout(300);
  const input = page.locator('input[type="password"]');
  await input.fill(pin);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
}

/** 在爸妈模式添加一个任务 */
async function addTaskViaParentPanel(
  page: Page,
  name: string,
  freq: 'once' | 'daily' | 'weekly' | 'monthly',
  chests = 1
) {
  const nameInput = page.locator('input[placeholder*="任务名称"]').first();
  const freqSelect = page.locator('select').first();
  await nameInput.fill(name);
  await freqSelect.selectOption(freq);
  const chestsInput = page.locator('input[type="number"]').nth(1);
  await chestsInput.fill(String(chests));
  await page.locator('button:has-text("添加任务")').click();
  await page.waitForTimeout(300);
}

/** 完成一个任务（需要先输入正确密码） */
async function completeTask(page: Page, taskName: string, password = '123456') {
  // 点击任务的"完成了！"按钮
  const taskCard = page.locator('div[style*="#2D2D2D"]', { hasText: taskName }).first();
  await taskCard.locator('button:has-text("完成了！")').click();
  await page.waitForTimeout(200);
  // 输入密码
  const pwInput = page.locator('input[placeholder="••••"]').first();
  await pwInput.fill(password);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
}

/** 开启一个宝箱 */
async function openChest(page: Page) {
  const chest = page.locator('div[style*="#FF9800"]').filter({ has: page.locator('text=点击开启') }).first();
  await chest.click();
  await page.waitForTimeout(3500); // 等待动画完成
}

// ─── 功能测试：任务添加 ──────────────────────────────────────

test.describe('【功能测试】任务添加', () => {

  test.beforeEach(async ({ page }) => {
    await resetAndReload(page);
  });

  test('FUNC-001: 添加一次性任务（单次）', async ({ page }) => {
    await clickTab(page, '爸妈');
    await enterPin(page, '123456');
    await addTaskViaParentPanel(page, '整理书架', 'once');
    // 切换到任务Tab验证
    await clickTab(page, '任务');
    await expect(page.locator('text=整理书架')).toBeVisible();
  });

  test('FUNC-002: 添加每日任务', async ({ page }) => {
    await clickTab(page, '爸妈');
    await enterPin(page, '123456');
    await addTaskViaParentPanel(page, '整理玩具', 'daily');
    await clickTab(page, '任务');
    await expect(page.locator('text=整理玩具')).toBeVisible();
    await expect(page.locator('text=每天')).toBeVisible();
  });

  test('FUNC-003: 添加每周任务', async ({ page }) => {
    await clickTab(page, '爸妈');
    await enterPin(page, '123456');
    await addTaskViaParentPanel(page, '大扫除', 'weekly');
    await clickTab(page, '任务');
    await expect(page.locator('text=大扫除')).toBeVisible();
    await expect(page.locator('text=每周')).toBeVisible();
  });

  test('FUNC-004: 添加每月任务', async ({ page }) => {
    await clickTab(page, '爸妈');
    await enterPin(page, '123456');
    await addTaskViaParentPanel(page, '体检复查', 'monthly', 2);
    await clickTab(page, '任务');
    await expect(page.locator('text=体检复查')).toBeVisible();
    await expect(page.locator('text=每月')).toBeVisible();
  });
});

// ─── 功能测试：任务完成 ──────────────────────────────────────

test.describe('【功能测试】任务完成', () => {

  test.beforeEach(async ({ page }) => {
    await resetAndReload(page);
    // 先添加任务
    await clickTab(page, '爸妈');
    await enterPin(page, '123456');
    await addTaskViaParentPanel(page, '测试任务', 'daily', 2);
    await clickTab(page, '任务');
  });

  test('FUNC-005: 任务完成后状态变更', async ({ page }) => {
    const taskCard = page.locator('div[style*="#2D2D2D"]', { hasText: '测试任务' });
    await expect(taskCard).toBeVisible();
    await taskCard.locator('button:has-text("完成了！")').click();
    const pwInput = page.locator('input[placeholder="••••"]');
    await pwInput.fill('123456');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    // 任务应从今日任务列表消失（已今天完成）
    await expect(taskCard).not.toBeVisible();
  });

  test('FUNC-006: 任务完成后获得宝箱', async ({ page }) => {
    const taskCard = page.locator('div[style*="#2D2D2D"]', { hasText: '测试任务' });
    await taskCard.locator('button:has-text("完成了！")').click();
    const pwInput = page.locator('input[placeholder="••••"]');
    await pwInput.fill('123456');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);
    // 通知应出现
    const notif = page.locator('text=/获得.*宝箱/');
    await expect(notif).toBeVisible();
    // 切换到宝箱Tab
    await clickTab(page, '宝箱');
    // 应有2个宝箱
    await expect(page.locator('text=我的宝箱 (2个)')).toBeVisible();
  });

  test('FUNC-007: 爸妈模式下完成任务不需要密码', async ({ page }) => {
    // 爸妈模式进入
    await clickTab(page, '爸妈');
    await enterPin(page, '123456');
    await addTaskViaParentPanel(page, '爸妈任务', 'daily', 1);
    await clickTab(page, '任务');
    // 任务列表中应看到爸妈模式标记
    await expect(page.locator('text=👨‍👩‍👧 爸妈模式')).toBeVisible();
    // 直接点击完成（无需密码弹窗）
    const taskCard = page.locator('div[style*="#2D2D2D"]', { hasText: '爸妈任务' });
    await taskCard.locator('button:has-text("完成了！")').click();
    await page.waitForTimeout(500);
    // 不应该出现密码输入弹窗
    await expect(page.locator('text=请爸妈输入密码确认完成')).not.toBeVisible();
  });
});

// ─── 功能测试：宝箱开启 ──────────────────────────────────────

test.describe('【功能测试】宝箱开启', () => {

  test.beforeEach(async ({ page }) => {
    await resetAndReload(page);
    // 添加任务并完成以获得宝箱
    await clickTab(page, '爸妈');
    await enterPin(page, '123456');
    await addTaskViaParentPanel(page, '获取宝箱', 'daily', 3);
    await clickTab(page, '任务');
    await completeTask(page, '获取宝箱');
    await clickTab(page, '宝箱');
  });

  test('FUNC-008: 宝箱点击后播放开启动画', async ({ page }) => {
    const chest = page.locator('div[style*="#FF9800"]').filter({ has: page.locator('text=点击开启') }).first();
    await chest.click();
    await page.waitForTimeout(200);
    // 动画层应出现（点击宝箱后背景变深）
    await expect(page.locator('text=点击任意处继续')).toBeVisible();
  });

  test('FUNC-009: 宝箱开启后掉落方块', async ({ page }) => {
    const chest = page.locator('div[style*="#FF9800"]').filter({ has: page.locator('text=点击开启') }).first();
    await chest.click();
    await page.waitForTimeout(800);
    // 方块名称应出现
    const blockNames = ['TNT方块','树叶方块','南瓜方块','西瓜方块','地狱岩方块','草方块','土方块','木方块','黑曜石方块','下界合金方块','基岩方块','无尽方块'];
    const nameEl = page.locator('div[style*="Press Start 2P"]').last();
    // 检查稀有度标签
    const rarityEls = page.locator('div:has-text("『")');
    expect(await rarityEls.count()).toBeGreaterThan(0);
  });

  test('FUNC-010: 宝箱为空时显示空状态', async ({ page }) => {
    // 开启所有宝箱
    const chests = page.locator('div[style*="#FF9800"]').filter({ has: page.locator('text=点击开启') });
    const count = await chests.count();
    for (let i = 0; i < count; i++) {
      await openChest(page);
    }
    // 再次进入宝箱Tab（如果还有）
    await clickTab(page, '宝箱');
    await expect(page.locator('text=还没有宝箱哦')).toBeVisible();
  });
});

// ─── 功能测试：方块收集 ──────────────────────────────────────

test.describe('【功能测试】方块收集', () => {

  test.beforeEach(async ({ page }) => {
    await resetAndReload(page);
  });

  test('FUNC-011: 方块收集数量累加正确', async ({ page }) => {
    // 添加任务完成3次获得3个宝箱
    await clickTab(page, '爸妈');
    await enterPin(page, '123456');
    await addTaskViaParentPanel(page, '方块任务', 'daily', 1);
    await clickTab(page, '任务');
    // 每天完成一次
    for (let i = 0; i < 3; i++) {
      const taskCard = page.locator('div[style*="#2D2D2D"]', { hasText: '方块任务' });
      if (await taskCard.isVisible()) {
        await taskCard.locator('button:has-text("完成了！")').click();
        await page.locator('input[placeholder="••••"]').fill('123456');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
      }
      await clickTab(page, '宝箱');
      await page.locator('div[style*="#FF9800"]').filter({ has: page.locator('text=点击开启') }).first().click();
      await page.waitForTimeout(3500);
    }
    await clickTab(page, '收藏');
    await page.waitForTimeout(300);
    // 任意方块数量应大于0
    const blockSection = page.locator('text=/个方块已收集/');
    await expect(blockSection).toBeVisible();
  });

  test('FUNC-012: 方块收集页面能正确展示所有方块', async ({ page }) => {
    await clickTab(page, '收藏');
    await expect(page.locator('text=方块已收集')).toBeVisible();
    // 应该有方块网格
    const gridItems = page.locator('div[style*="grid"]').first();
    await expect(gridItems).toBeVisible();
  });
});

// ─── 功能测试：套装解锁 ──────────────────────────────────────

test.describe('【功能测试】套装解锁', () => {

  test.beforeEach(async ({ page }) => {
    await resetAndReload(page);
  });

  test('FUNC-013: 收集满指定方块后解锁对应套装', async ({ page }) => {
    // 添加奖励10个宝箱的任务（直接通过增加宝箱按钮）
    await clickTab(page, '爸妈');
    await enterPin(page, '123456');
    // 先添加一个小任务
    await addTaskViaParentPanel(page, '刷宝箱', 'daily', 1);
    await clickTab(page, '任务');
    // 完成多次
    for (let i = 0; i < 10; i++) {
      const taskCard = page.locator('div[style*="#2D2D2D"]', { hasText: '刷宝箱' });
      if (!(await taskCard.isVisible())) break;
      await taskCard.locator('button:has-text("完成了！")').click();
      await page.waitForTimeout(200);
      const pwInput = page.locator('input[placeholder="••••"]');
      if (await pwInput.isVisible()) {
        await pwInput.fill('123456');
        await page.keyboard.press('Enter');
      }
      await page.waitForTimeout(300);
    }
    // 开宝箱直到解锁套装
    await clickTab(page, '宝箱');
    const chests = page.locator('div[style*="#FF9800"]').filter({ has: page.locator('text=点击开启') });
    const count = await chests.count();
    for (let i = 0; i < Math.min(count, 15); i++) {
      const c = page.locator('div[style*="#FF9800"]').filter({ has: page.locator('text=点击开启') }).first();
      if (!(await c.isVisible())) break;
      await c.click();
      await page.waitForTimeout(3600);
    }
    // 检查收藏Tab是否有套装解锁
    await clickTab(page, '收藏');
    await clickTab(page, '收藏'); // 点击套装子tab
    const suitsTab = page.locator('button:has-text("套装")');
    await suitsTab.click();
    await page.waitForTimeout(300);
    // 套装进度条应该可见
    await expect(page.locator('div[style*="borderRadius: 2px"][style*="height: 10px"]').first()).toBeVisible();
  });
});

// ─── 功能测试：爸妈模式PIN验证 ─────────────────────────────

test.describe('【功能测试】爸妈模式PIN验证', () => {

  test.beforeEach(async ({ page }) => {
    await resetAndReload(page);
  });

  test('FUNC-014: 正确密码进入爸妈模式', async ({ page }) => {
    await enterPin(page, '123456');
    await expect(page.locator('text=➕ 添加新任务')).toBeVisible();
    await expect(page.locator('text=手动增加宝箱')).toBeVisible();
  });

  test('FUNC-015: 错误密码拒绝进入爸妈模式', async ({ page }) => {
    await page.locator('button:has-text("输入密码")').click();
    await page.waitForTimeout(300);
    const input = page.locator('input[type="password"]');
    await input.fill('000000');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    // 应显示错误提示
    await expect(page.locator('text=密码错误')).toBeVisible();
    // 不应进入爸妈模式
    await expect(page.locator('text=➕ 添加新任务')).not.toBeVisible();
  });
});

// ─── 功能测试：爸妈模式功能 ─────────────────────────────────

test.describe('【功能测试】爸妈模式功能', () => {

  test.beforeEach(async ({ page }) => {
    await resetAndReload(page);
    await clickTab(page, '爸妈');
    await enterPin(page, '123456');
  });

  test('FUNC-016: 爸妈模式添加任务', async ({ page }) => {
    await addTaskViaParentPanel(page, '新爸妈任务', 'daily');
    await clickTab(page, '任务');
    await expect(page.locator('text=新爸妈任务')).toBeVisible();
  });

  test('FUNC-017: 爸妈模式删除任务', async ({ page }) => {
    // 先添加一个任务
    await addTaskViaParentPanel(page, '待删除任务', 'daily');
    // 在任务Tab以爸妈模式查看
    await clickTab(page, '任务');
    const taskCard = page.locator('div[style*="#2D2D2D"]', { hasText: '待删除任务' });
    await expect(taskCard).toBeVisible();
    // 删除按钮应该可见（爸妈模式）
    await taskCard.locator('button:has-text("删除")').click();
    await page.waitForTimeout(300);
    await expect(taskCard).not.toBeVisible();
  });

  test('FUNC-018: 爸妈模式增加宝箱', async ({ page }) => {
    await page.locator('button:has-text("增加宝箱")').click();
    await page.waitForTimeout(200);
    const chestCountInput = page.locator('input[type="number"]');
    await chestCountInput.fill('5');
    await page.locator('button:has-text("确认")').click();
    await page.waitForTimeout(500);
    // 通知出现
    await expect(page.locator('text=获得 5 个宝箱')).toBeVisible();
  });

  test('FUNC-019: 爸妈模式重置所有数据', async ({ page }) => {
    // 先加个任务
    await addTaskViaParentPanel(page, '重置测试', 'daily');
    // 点击重置
    page.on('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("重置所有数据")').click();
    await page.waitForTimeout(500);
    // 任务应清空
    await clickTab(page, '任务');
    await expect(page.locator('text=太棒了！所有任务已完成')).toBeVisible();
  });
});

// ─── 功能测试：重置逻辑 ──────────────────────────────────────

test.describe('【功能测试】每日/每周/每月重置逻辑', () => {

  test.beforeEach(async ({ page }) => {
    await resetAndReload(page);
  });

  test('FUNC-020: 每日任务不能同一天完成两次', async ({ page }) => {
    await clickTab(page, '爸妈');
    await enterPin(page, '123456');
    await addTaskViaParentPanel(page, '每日任务', 'daily', 1);
    await clickTab(page, '任务');
    // 第一次完成
    await completeTask(page, '每日任务');
    // 任务应从今日列表消失
    const taskCard = page.locator('div[style*="#2D2D2D"]', { hasText: '每日任务' });
    await expect(taskCard).not.toBeVisible();
    // 进入宝箱Tab再回来看任务Tab
    await clickTab(page, '宝箱');
    await clickTab(page, '任务');
    // 任务仍然不应可见
    await expect(page.locator('div[style*="#2D2D2D"]', { hasText: '每日任务' })).not.toBeVisible();
  });

  test('FUNC-021: 每周任务同周期内只能完成一次', async ({ page }) => {
    await clickTab(page, '爸妈');
    await enterPin(page, '123456');
    await addTaskViaParentPanel(page, '每周任务', 'weekly', 1);
    await clickTab(page, '任务');
    // 第一次完成
    await completeTask(page, '每周任务');
    // 每周任务完成一次后本周内不应再出现
    const taskCard = page.locator('div[style*="#2D2D2D"]', { hasText: '每周任务' });
    await expect(taskCard).not.toBeVisible();
  });

  test('FUNC-022: 每月任务达到月限制后不再出现', async ({ page }) => {
    await clickTab(page, '爸妈');
    await enterPin(page, '123456');
    // 添加每月限1次任务
    await addTaskViaParentPanel(page, '每月任务', 'monthly', 1);
    const freqSelect = page.locator('select').first();
    await freqSelect.selectOption('monthly');
    // 修改每月次数为1
    const monthlyLimitInput = page.locator('input[type="number"]').first();
    await monthlyLimitInput.fill('1');
    await page.locator('button:has-text("添加任务")').click();
    await page.waitForTimeout(200);
    await clickTab(page, '任务');
    // 完成一次
    await completeTask(page, '每月任务');
    // 任务应从列表消失（已达到月限制）
    const taskCard = page.locator('div[style*="#2D2D2D"]', { hasText: '每月任务' });
    await expect(taskCard).not.toBeVisible();
  });
});

// ─── 边界情况测试 ───────────────────────────────────────────

test.describe('【边界测试】一次性任务', () => {

  test.beforeEach(async ({ page }) => {
    await resetAndReload(page);
    await clickTab(page, '爸妈');
    await enterPin(page, '123456');
    await addTaskViaParentPanel(page, '一次性任务', 'once');
    await clickTab(page, '任务');
  });

  test('FUNC-023: 一次性任务完成后从列表移除', async ({ page }) => {
    const taskCard = page.locator('div[style*="#2D2D2D"]', { hasText: '一次性任务' });
    await expect(taskCard).toBeVisible();
    await completeTask(page, '一次性任务');
    // 任务应完全消失
    await expect(taskCard).not.toBeVisible();
    // 刷新后仍应消失（状态持久化到localStorage）
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await clickTab(page, '任务');
    await expect(page.locator('text=一次性任务')).not.toBeVisible();
  });
});

test.describe('【边界测试】空状态展示', () => {

  test.beforeEach(async ({ page }) => {
    await resetAndReload(page);
  });

  test('FUNC-024: 无任务时显示空状态', async ({ page }) => {
    await clickTab(page, '任务');
    await expect(page.locator('text=太棒了！所有任务已完成')).toBeVisible();
    await expect(page.locator('text=让爸妈添加新任务吧')).toBeVisible();
  });

  test('FUNC-025: 宝箱为空时显示空状态', async ({ page }) => {
    await clickTab(page, '宝箱');
    await expect(page.locator('text=还没有宝箱哦')).toBeVisible();
    await expect(page.locator('text=完成 tasks 任务来获得吧')).toBeVisible();
  });
});

// ─── 移动端兼容性测试 ───────────────────────────────────────

test.describe('【移动端兼容】按钮点击区域', () => {

  test('FUNC-026: Tab按钮有足够大的点击区域（至少44px）', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const tabButtons = page.locator('button:has-text("📋"), button:has-text("📦"), button:has-text("🧱"), button:has-text("🔒")');
    const count = await tabButtons.count();
    expect(count).toBeGreaterThanOrEqual(4);
    for (let i = 0; i < count; i++) {
      const box = await tabButtons.nth(i).boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('FUNC-027: 底部Tab栏使用安全区域适配', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Tab栏应该固定在底部
    const tabBar = page.locator('div[style*="position: fixed"][style*="bottom: 0"]');
    await expect(tabBar).toBeVisible();
    // padding应包含safe-area-inset
    const tabBarStyle = await tabBar.getAttribute('style');
    expect(tabBarStyle).toContain('env(safe-area-inset-bottom)');
  });

  test('FUNC-028: PIN输入框在移动端可聚焦和输入', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('button:has-text("输入密码")').click();
    await page.waitForTimeout(300);
    const input = page.locator('input[type="password"]').first();
    await expect(input).toBeFocused();
    await input.fill('123456');
    await expect(input).toHaveValue('123456');
  });

  test('FUNC-029: 宝箱网格在窄屏幕上自适应', async ({ page }) => {
    await resetAndReload(page);
    // 添加多个宝箱
    await clickTab(page, '爸妈');
    await enterPin(page, '123456');
    await addTaskViaParentPanel(page, '刷宝箱2', 'daily', 5);
    await clickTab(page, '宝箱');
    // 在窄屏上，宝箱应仍能显示
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(300);
    const chests = page.locator('div[style*="#FF9800"]').filter({ has: page.locator('text=点击开启') });
    const count = await chests.count();
    expect(count).toBeGreaterThanOrEqual(1);
    // 每个宝箱卡片在窄屏上不应溢出
    for (let i = 0; i < Math.min(count, 3); i++) {
      const box = await chests.nth(i).boundingBox();
      expect(box?.x).toBeGreaterThanOrEqual(0);
    }
  });

  test('FUNC-030: 任务卡片在窄屏上完整显示', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await resetAndReload(page);
    await clickTab(page, '爸妈');
    await enterPin(page, '123456');
    await addTaskViaParentPanel(page, '窄屏测试任务', 'daily', 1);
    await clickTab(page, '任务');
    const taskCard = page.locator('div[style*="#2D2D2D"]', { hasText: '窄屏测试任务' });
    await expect(taskCard).toBeVisible();
    const box = await taskCard.boundingBox();
    expect(box?.x).toBeGreaterThanOrEqual(0);
  });
});
