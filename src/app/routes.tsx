import { createBrowserRouter } from 'react-router-dom';
import Root from './pages/Root';
import Splash from './pages/Splash';
import RoleSelect from './pages/RoleSelect';
import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import HostDashboard from './pages/HostDashboard';
import HostMap from './pages/HostMap';
import Payment from './pages/Payment';
import Map from './pages/Map';
import Saved from './pages/Saved';
import Trips from './pages/Trips';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Conversation from './pages/Conversation';
import HostListings from './pages/HostListings';
import HostBookings from './pages/HostBookings';
import HostEarnings from './pages/HostEarnings';
import HostProfile from './pages/HostProfile';
import HostResources from './pages/HostResources';
import HostAccountSettings from './pages/HostAccountSettings';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import GuestLogin from './pages/GuestLogin';
import HostLogin from './pages/HostLogin';
import Signup from './pages/Signup';
import GuestSignup from './pages/GuestSignup';
import HostSignup from './pages/HostSignup';
import ForgotPassword from './pages/ForgotPassword';
import GuestForgotPassword from './pages/GuestForgotPassword';
import HostForgotPassword from './pages/HostForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OauthCallback from './pages/OauthCallback';
import {
  PersonalInformation,
  LoginSecurity,
  PaymentMethods,
  NotificationSettings,
  HelpCenter,
  TermsAndPolicies,
  HostPayoutMethods,
  PerformanceInsights,
} from './pages/ProfilePages';

const routes = [
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Splash },
      { path: 'role/:mode', Component: RoleSelect },
      { path: 'home', Component: Home },
      { path: 'property/:id', Component: PropertyDetail },
      { path: 'payment/:propertyId', Component: Payment },
      { path: 'map', Component: Map },
      { path: 'saved', Component: Saved },
      { path: 'trips', Component: Trips },
      { path: 'profile', Component: Profile },
      { path: 'messages', Component: Messages },
      { path: 'conversation/:id', Component: Conversation },
      { path: 'login', Component: Login },
      { path: 'login/guest', Component: GuestLogin },
      { path: 'login/host', Component: HostLogin },
      { path: 'signup', Component: Signup },
      { path: 'signup/guest', Component: GuestSignup },
      { path: 'signup/host', Component: HostSignup },
      { path: 'forgot-password', Component: ForgotPassword },
      { path: 'forgot-password/guest', Component: GuestForgotPassword },
      { path: 'forgot-password/host', Component: HostForgotPassword },
      { path: 'reset-password', Component: ResetPassword },
      { path: 'oauth/callback', Component: OauthCallback },
      { path: 'profile/personal', Component: PersonalInformation },
      { path: 'profile/security', Component: LoginSecurity },
      { path: 'profile/payments', Component: PaymentMethods },
      { path: 'profile/notifications', Component: NotificationSettings },
      { path: 'profile/help', Component: HelpCenter },
      { path: 'profile/terms', Component: TermsAndPolicies },
      { path: 'host', Component: HostDashboard },
      { path: 'host/map', Component: HostMap },
      { path: 'host/listings', Component: HostListings },
      { path: 'host/bookings', Component: HostBookings },
      { path: 'host/earnings', Component: HostEarnings },
      { path: 'host/profile', Component: HostProfile },
      { path: 'host/settings/payouts', Component: HostPayoutMethods },
      { path: 'host/settings/insights', Component: PerformanceInsights },
      { path: 'host/settings/resources', Component: HostResources },
      { path: 'host/settings/account', Component: HostAccountSettings },
      { path: '*', Component: NotFound },
    ],
  },
];

export const router = createBrowserRouter(routes);
export default routes;
