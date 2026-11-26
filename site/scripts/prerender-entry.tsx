import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';
import App from '../src/App';
import Home from '../src/landing-v2/HomePage';
export function renderPublicPage(pathname:string){return renderToString(<StaticRouter location={pathname}><App home={Home}/></StaticRouter>)}
