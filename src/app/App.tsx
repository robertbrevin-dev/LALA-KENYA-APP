import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './routes';
import { AppProvider } from './context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--lala-card)',
            color: 'var(--lala-white)',
            border: '1px solid var(--lala-border)',
            fontFamily: 'var(--font-dm-sans)',
          },
        }}
      />
    </AppProvider>
  );
}