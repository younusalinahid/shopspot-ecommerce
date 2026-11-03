import {useEffect} from 'react';
import {useSiteContent} from '../../hooks/useSiteContent';

// Icons from public/index.html, used again when the uploaded logo is removed
const ICON_LINKS = [...document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')]
    .map(link => ({link, defaultHref: link.href}));

/** Keeps the browser tab icon the same as the logo uploaded in Admin -> Site Content. */
export default function SiteFavicon() {
    const {logoUrl} = useSiteContent();

    useEffect(() => {
        ICON_LINKS.forEach(({link, defaultHref}) => {
            link.href = logoUrl || defaultHref;
        });
    }, [logoUrl]);

    return null;
}
