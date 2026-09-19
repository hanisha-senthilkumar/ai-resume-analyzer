import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('/auth', 'routes/auth.tsx'),
    route('/upload', 'routes/upload.tsx'),
    route('/resume/:id', 'routes/resume.tsx'),
    route('/compare', 'routes/compare.tsx'),
    route('/match', 'routes/match.tsx'),
    route('/rebuild', 'routes/rebuild.tsx', { id: 'rebuild-main' }),
    route('/rebuild/:id', 'routes/rebuild.tsx', { id: 'rebuild-id' }),
    route('/wipe', 'routes/wipe.tsx'),
] satisfies RouteConfig;
