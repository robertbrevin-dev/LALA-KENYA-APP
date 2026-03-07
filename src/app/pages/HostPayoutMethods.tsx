import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/PhoneFrame';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { supabase } from '../../lib/supabase';
import BackRefreshBar from '../components/BackRefreshBar';

export default function HostPayoutMethods() {
  const navigate = useNavigate();
  const { currentUser, loading: appLoading } = useApp();
  const user = currentUser;
  const [payoutMethods, setPayoutMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [methodType, setMethodType] = useState<'mpesa' | 'bank'>('mpesa');
  const [formData, setFormData] = useState({
    mpesaNumber: '',
    mpesaName: '',
    bankName: '',
    bankAccount: '',
    bankBranch: '',
    bankAccountName: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Protect route
  useEffect(() => {
    if (!appLoading && !user) {
      navigate('/login');
    }
  }, [appLoading, user, navigate]);

  useEffect(() => {
    async function fetchPayoutMethods() {
      if (!user?.id) {
        setPayoutMethods([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('payout_methods')
        .select('*')
        .eq('host_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) console.error('Error loading payout methods:', error);
      else setPayoutMethods(data || []);
      setLoading(false);
    }
    fetchPayoutMethods();
  }, [user?.id]);

  const handleSetDefault = async (id: string) => {
    // First, unset all defaults
    await supabase
      .from('payout_methods')
      .update({ is_default: false })
      .eq('host_id', user?.id);

    // Then set the new default
    const { error } = await supabase
      .from('payout_methods')
      .update({ is_default: true })
      .eq('id', id);

    if (!error) {
      setPayoutMethods(prev => 
        prev.map(method => ({
          ...method,
          is_default: method.id === id
        }))
      );
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('payout_methods')
      .delete()
      .eq('id', id);

    if (!error) {
      setPayoutMethods(prev => prev.filter(method => method.id !== id));
    }
  };

  const handleAdd = async () => {
    if (!user?.id) return;
    
    // Validation
    if (methodType === 'mpesa') {
      if (!formData.mpesaNumber || !formData.mpesaName) {
        setError('M-Pesa number and name are required');
        return;
      }
      if (!/^2547[0-9]{8}$/.test(formData.mpesaNumber.replace(/\s/g, ''))) {
        setError('Please enter a valid M-Pesa number (e.g., 254712345678)');
        return;
      }
    } else {
      if (!formData.bankName || !formData.bankAccount || !formData.bankAccountName) {
        setError('Bank name, account number, and account name are required');
        return;
      }
    }

    setSaving(true);
    setError('');

    try {
      const methodDetails = methodType === 'mpesa' 
        ? { number: formData.mpesaNumber, name: formData.mpesaName }
        : {
            bankName: formData.bankName,
            accountNumber: formData.bankAccount,
            branch: formData.bankBranch,
            accountName: formData.bankAccountName
          };

      const { data, error } = await supabase.from('payout_methods').insert({
        host_id: user.id,
        method_type: methodType,
        method_details: methodDetails,
        is_default: payoutMethods.length === 0, // First method is default
        is_active: true,
      }).select('*').single();

      if (error) throw error;
      
      setPayoutMethods(prev => [data, ...prev]);
      setShowAdd(false);
      setFormData({
        mpesaNumber: '',
        mpesaName: '',
        bankName: '',
        bankAccount: '',
        bankBranch: '',
        bankAccountName: '',
      });
    } catch (e: any) {
      setError(e.message || 'Failed to add payout method');
    } finally {
      setSaving(false);
    }
  };

  // While auth is resolving, show loading
  if (appLoading && !user) {
    return (
      <PhoneFrame>
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <BackRefreshBar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-[14px]" style={{ color: 'var(--lala-muted)' }}>
              Loading…
            </div>
          </div>
        </div>
        <BottomNav type="host" />
      </PhoneFrame>
    );
  }

  if (!user) return null;

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <BackRefreshBar />
        
        {/* Header */}
        <div className="px-6 pt-14 pb-5">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-[28px] mb-1"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--lala-white)' }}>
            Payout Methods
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-[14px]" style={{ color: 'var(--lala-soft)' }}>
            Manage how you receive payments
          </motion.p>
        </div>

        <div className="px-6 pb-24">
          {loading ? (
            <div className="text-center py-10" style={{ color: 'var(--lala-muted)' }}>Loading...</div>
          ) : payoutMethods.length === 0 ? (
            <div className="rounded-[20px] p-10 text-center mb-4"
              style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
              <div className="text-[48px] mb-3">💳</div>
              <div className="text-[15px] mb-1" style={{ color: 'var(--lala-white)', fontWeight: 600 }}>No payout methods</div>
              <div className="text-[13px]" style={{ color: 'var(--lala-muted)' }}>Add a payout method to receive earnings</div>
            </div>
          ) : (
            payoutMethods.map((method, index) => (
              <motion.div key={method.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-[16px] p-4 mb-3"
                style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
                
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[12px] flex items-center justify-center text-[20px]"
                      style={{ background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)' }}>
                      {method.method_type === 'mpesa' ? '📱' : '🏦'}
                    </div>
                    <div>
                      <div className="text-[15px] mb-0.5" style={{ fontWeight: 600, color: 'var(--lala-white)' }}>
                        {method.method_type === 'mpesa' ? 'M-Pesa' : 'Bank Transfer'}
                        {method.is_default && (
                          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-[20px]"
                            style={{ background: 'var(--lala-teal)', color: 'var(--lala-night)', fontWeight: 600 }}>
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <div className="text-[13px]" style={{ color: 'var(--lala-muted)' }}>
                        {method.method_type === 'mpesa' 
                          ? method.method_details.number
                          : `${method.method_details.bankName} - ${method.method_details.accountNumber}`
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!method.is_default && (
                    <button onClick={() => handleSetDefault(method.id)}
                      className="flex-1 py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]"
                      style={{ background: 'rgba(62,207,178,0.12)', color: 'var(--lala-teal)', fontWeight: 600 }}>
                      Set as Default
                    </button>
                  )}
                  <button onClick={() => handleDelete(method.id)}
                    className="flex-1 py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]"
                    style={{ background: 'rgba(255,107,107,0.12)', color: '#FF6B6B', fontWeight: 600 }}>
                    Remove
                  </button>
                </div>
              </motion.div>
            ))
          )}

          {/* Add New Method */}
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            onClick={() => setShowAdd(true)}
            className="w-full py-4 rounded-[16px] border-2 border-dashed cursor-pointer"
            style={{ background: 'transparent', borderColor: 'var(--lala-border)', color: 'var(--lala-gold)', fontWeight: 600 }}>
            + Add Payout Method
          </motion.button>
        </div>
      </div>
      <BottomNav type="host" />
      
      {showAdd && (
        <div className="absolute inset-0 z-50">
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => !saving && setShowAdd(false)} />
          <div className="absolute right-0 top-0 h-full w-full md:w-[520px] p-5 overflow-y-auto"
            style={{ background: 'var(--lala-deep)', borderLeft: '1px solid var(--lala-border)' }}>
            
            <div className="flex items-center justify-between mb-4">
              <div className="text-[18px]" style={{ fontWeight: 700, color: 'var(--lala-white)' }}>Add Payout Method</div>
              <button disabled={saving} onClick={() => setShowAdd(false)} className="px-3 py-1 rounded-[10px] border-none cursor-pointer"
                style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }}>
                Close
              </button>
            </div>
            
            {!!error && <div className="text-[12px] mb-2" style={{ color: '#FF6B6B' }}>{error}</div>}
            
            <div className="grid gap-3">
              {/* Method Type Toggle */}
              <div className="flex rounded-[14px] p-1" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
                {(['mpesa', 'bank'] as const).map(type => (
                  <button key={type} onClick={() => setMethodType(type)}
                    className="flex-1 py-2.5 rounded-[11px] border-none cursor-pointer text-[13px] font-bold"
                    style={{ 
                      background: methodType === type ? 'var(--lala-gold)' : 'transparent', 
                      color: methodType === type ? 'var(--lala-night)' : 'var(--lala-muted)' 
                    }}>
                    {type === 'mpesa' ? '📱 M-Pesa' : '🏦 Bank'}
                  </button>
                ))}
              </div>

              {methodType === 'mpesa' ? (
                <>
                  <div>
                    <div className="text-[12px] mb-1" style={{ color: 'var(--lala-muted)' }}>M-Pesa Number</div>
                    <input 
                      value={formData.mpesaNumber} 
                      onChange={e => setFormData(prev => ({ ...prev, mpesaNumber: e.target.value }))}
                      placeholder="254712345678" 
                      className="w-full px-3 py-2 rounded-[12px] outline-none"
                      style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }} 
                    />
                  </div>
                  <div>
                    <div className="text-[12px] mb-1" style={{ color: 'var(--lala-muted)' }}>Account Name</div>
                    <input 
                      value={formData.mpesaName} 
                      onChange={e => setFormData(prev => ({ ...prev, mpesaName: e.target.value }))}
                      placeholder="John Doe" 
                      className="w-full px-3 py-2 rounded-[12px] outline-none"
                      style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }} 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="text-[12px] mb-1" style={{ color: 'var(--lala-muted)' }}>Bank Name</div>
                    <input 
                      value={formData.bankName} 
                      onChange={e => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                      placeholder="Equity Bank" 
                      className="w-full px-3 py-2 rounded-[12px] outline-none"
                      style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }} 
                    />
                  </div>
                  <div>
                    <div className="text-[12px] mb-1" style={{ color: 'var(--lala-muted)' }}>Account Number</div>
                    <input 
                      value={formData.bankAccount} 
                      onChange={e => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
                      placeholder="1234567890" 
                      className="w-full px-3 py-2 rounded-[12px] outline-none"
                      style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }} 
                    />
                  </div>
                  <div>
                    <div className="text-[12px] mb-1" style={{ color: 'var(--lala-muted)' }}>Branch (Optional)</div>
                    <input 
                      value={formData.bankBranch} 
                      onChange={e => setFormData(prev => ({ ...prev, bankBranch: e.target.value }))}
                      placeholder="Kilimani Branch" 
                      className="w-full px-3 py-2 rounded-[12px] outline-none"
                      style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }} 
                    />
                  </div>
                  <div>
                    <div className="text-[12px] mb-1" style={{ color: 'var(--lala-muted)' }}>Account Name</div>
                    <input 
                      value={formData.bankAccountName} 
                      onChange={e => setFormData(prev => ({ ...prev, bankAccountName: e.target.value }))}
                      placeholder="John Doe" 
                      className="w-full px-3 py-2 rounded-[12px] outline-none"
                      style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }} 
                    />
                  </div>
                </>
              )}
              
              <button disabled={saving} onClick={handleAdd} className="w-full py-3 rounded-[14px] border-none cursor-pointer"
                style={{ background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)', color: 'var(--lala-night)', fontWeight: 700 }}>
                {saving ? 'Adding…' : 'Add Method'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}
