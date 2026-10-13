import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// 3D 场景基于开源项目 portfolio-itom（Tomasz Szmajda，MIT 许可证）改编
if (typeof window !== 'undefined') {
  console.log(
    '%c 衣着之间 %c AI 童装视觉作品集 %c',
    'background: #111; color: #fff; padding: 5px 10px; font-weight: bold; border-radius: 3px 0 0 3px;',
    'background: #e9a23b; color: #111; padding: 5px 10px; font-weight: bold; border-radius: 0 3px 3px 0;',
    'background: transparent'
  );
  console.log('%c3D 场景基于 portfolio-itom（Tomasz Szmajda, MIT）· https://github.com/ITomPoland/portfolio-itom', 'color: #666;');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
