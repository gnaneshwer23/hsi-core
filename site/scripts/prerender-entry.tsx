import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';
import App from '../src/App';
export function renderPublicPage(pathname:string){return renderToString(<StaticRouter location={pathname}><App/></StaticRouter>)}
