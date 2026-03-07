const fs = require('fs');
let c = fs.readFileSync('src/app/routes.tsx', 'utf8');

const authRoutes = `
      { path: 'login', Component: Login },
      { path: 'login/guest', Component: GuestLogin },
      { path: 'login/host', Component: HostLogin },
      { path: 'signup', Component: Signup },
      { path: 'signup/guest', Component: GuestSignup },
      { path: 'signup/host', Component: HostSignup },
      { path: 'forgot-password', Component: ForgotPassword },
      { path: 'reset-password', Component: ResetPassword },
      { path: 'oauth/callback', Component: OauthCallback },`;

c = c.replace(
  "{ path: 'role/:mode', Component: RoleSelect },",
  "{ path: 'role/:mode', Component: RoleSelect }," + authRoutes
);

fs.writeFileSync('src/app/routes.tsx', c);
console.log('done');
