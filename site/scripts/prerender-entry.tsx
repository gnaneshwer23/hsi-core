import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';
import App from '../src/App';
import Home from '../src/landing-v2/HomePage';
import Landing from '../src/landing-v2/LandingV2Static';
export function renderPublicPage(pathname:string){return renderToString(<StaticRouter location={pathname}><App home={Home} landing={Landing}/></StaticRouter>)}
