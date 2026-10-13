import { use } from 'react';
import { loadPortfolio, getPortfolioSync } from '../content/portfolio';

/**
 * 在 R3F 场景（<Suspense> 内）中读取 portfolio.json。
 * 数据未加载完时会挂起，加载完成后同步返回。
 */
export function usePortfolioSuspense() {
    return use(loadPortfolio());
}

export function isPortfolioLoaded() {
    return !!getPortfolioSync();
}

export { loadPortfolio };
