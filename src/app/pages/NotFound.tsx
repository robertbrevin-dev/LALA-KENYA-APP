import PhoneFrame from '../components/PhoneFrame';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-[80px] mb-4">🏠</div>
        <h1 
          className="text-[28px] mb-3 text-center"
          style={{
            fontFamily: 'var(--font-playfair)',
            fontWeight: 900,
            color: 'var(--lala-white)'
          }}
        >
          Page Not Found
        </h1>
        <p 
          className="text-[14px] mb-8 text-center"
          style={{ color: 'var(--lala-soft)' }}
        >
          The page you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-3 rounded-[14px] border-none cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)',
            color: 'var(--lala-night)',
            fontWeight: 700
          }}
        >
          Go to Home
        </button>
      </div>
    </PhoneFrame>
  );
}
