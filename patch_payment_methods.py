# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "  const [paying, setPaying] = useState(false);",
    "  const [paying, setPaying] = useState(false);\n  const [payMethod, setPayMethod] = useState<'mpesa'|'airtel'|'card'|null>(null);\n  const [payPhone, setPayPhone] = useState('');\n  const [payType, setPayType] = useState<'full'|'deposit'|null>(null);"
)

c = c.replace(
    """              {booking.booking_status === 'accepted' && (
                <div className="px-4 py-4 space-y-2.5">
                  <button onClick={() => handlePay('full')} disabled={paying} className="w-full py-3.5 rounded-[14px] border-none cursor-pointer text-[14px]" style={{ background: 'linear-gradient(135deg, #3ECFB2, #2AA893)', color: '#061412', fontWeight: 800 }}>
                    {paying ? 'Processing...' : 'Pay Full - Ksh ' + Math.round(Number(booking.total_amount)*1.03).toLocaleString()}
                  </button>
                  <button onClick={() => handlePay('deposit')} disabled={paying} className="w-full py-3 rounded-[14px] border-none cursor-pointer text-[14px]" style={{ background: 'rgba(232,184,109,0.1)', color: '#E8B86D', fontWeight: 700, border: '1px solid rgba(232,184,109,0.25)' }}>
                    {'Pay Deposit (50%) - Ksh ' + Math.round(Number(booking.total_amount)*0.5).toLocaleString()}
                  </button>
                  <button onClick={handleCancelBooking} disabled={paying} className="w-full py-2.5 rounded-[14px] border-none cursor-pointer text-[13px]" style={{ background: 'transparent', color: 'rgba(255,107,107,0.7)', fontWeight: 600 }}>
                    Cancel Request
                  </button>
                </div>
              )}""",
    """              {booking.booking_status === 'accepted' && !payType && (
                <div className="px-4 py-4 space-y-2.5">
                  <button onClick={() => setPayType('full')} className="w-full py-3.5 rounded-[14px] border-none cursor-pointer text-[14px]" style={{ background: 'linear-gradient(135deg, #3ECFB2, #2AA893)', color: '#061412', fontWeight: 800 }}>
                    Pay Full &mdash; Ksh {Math.round(Number(booking.total_amount)*1.03).toLocaleString()}
                  </button>
                  <button onClick={() => setPayType('deposit')} className="w-full py-3 rounded-[14px] border-none cursor-pointer text-[14px]" style={{ background: 'rgba(232,184,109,0.1)', color: '#E8B86D', fontWeight: 700, border: '1px solid rgba(232,184,109,0.25)' }}>
                    Pay Deposit 50% &mdash; Ksh {Math.round(Number(booking.total_amount)*0.5).toLocaleString()}
                  </button>
                  <button onClick={handleCancelBooking} className="w-full py-2.5 rounded-[14px] border-none cursor-pointer text-[13px]" style={{ background: 'transparent', color: 'rgba(255,107,107,0.7)', fontWeight: 600 }}>
                    Cancel Request
                  </button>
                </div>
              )}
              {booking.booking_status === 'accepted' && payType && !payMethod && (
                <div className="px-4 py-4">
                  <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setPayType(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lala-muted)', padding: 0 }}>&#8592;</button>
                    <div className="text-[13px]" style={{ color: 'var(--lala-muted)' }}>Choose payment method</div>
                  </div>
                  <div className="space-y-3">
                    <button onClick={() => setPayMethod('mpesa')} className="w-full py-3.5 rounded-[14px] border-none cursor-pointer flex items-center gap-3 px-4" style={{ background: 'rgba(0,150,57,0.1)', border: '1px solid rgba(0,150,57,0.3)' }}>
                      <svg width="36" height="24" viewBox="0 0 36 24" fill="none"><rect width="36" height="24" rx="6" fill="#009639"/><text x="5" y="16" fontFamily="Arial" fontWeight="900" fontSize="11" fill="white">M-PESA</text></svg>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ color: '#00c44f', fontWeight: 700, fontSize: 14 }}>M-Pesa</div>
                        <div style={{ color: 'var(--lala-muted)', fontSize: 11 }}>Safaricom mobile money</div>
                      </div>
                    </button>
                    <button onClick={() => setPayMethod('airtel')} className="w-full py-3.5 rounded-[14px] border-none cursor-pointer flex items-center gap-3 px-4" style={{ background: 'rgba(255,0,0,0.07)', border: '1px solid rgba(255,0,0,0.2)' }}>
                      <svg width="36" height="24" viewBox="0 0 36 24" fill="none"><rect width="36" height="24" rx="6" fill="#FF0000"/><text x="4" y="16" fontFamily="Arial" fontWeight="900" fontSize="10" fill="white">AIRTEL</text></svg>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ color: '#ff4444', fontWeight: 700, fontSize: 14 }}>Airtel Money</div>
                        <div style={{ color: 'var(--lala-muted)', fontSize: 11 }}>Airtel mobile money</div>
                      </div>
                    </button>
                    <button onClick={() => setPayMethod('card')} className="w-full py-3.5 rounded-[14px] border-none cursor-pointer flex items-center gap-3 px-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
                      <svg width="36" height="24" viewBox="0 0 36 24" fill="none"><rect width="36" height="24" rx="6" fill="#1A1F71"/><circle cx="14" cy="12" r="7" fill="#EB001B"/><circle cx="22" cy="12" r="7" fill="#F79E1B"/><path d="M18 6.8a7 7 0 010 10.4A7 7 0 0118 6.8z" fill="#FF5F00"/></svg>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ color: '#818cf8', fontWeight: 700, fontSize: 14 }}>Visa / Mastercard</div>
                        <div style={{ color: 'var(--lala-muted)', fontSize: 11 }}>Credit or debit card</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
              {booking.booking_status === 'accepted' && payType && payMethod && payMethod !== 'card' && (
                <div className="px-4 py-4">
                  <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setPayMethod(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lala-muted)', padding: 0 }}>&#8592;</button>
                    <div className="text-[13px]" style={{ color: 'var(--lala-muted)' }}>{payMethod === 'mpesa' ? 'M-Pesa' : 'Airtel Money'} number</div>
                  </div>
                  <input type="tel" value={payPhone} onChange={e => setPayPhone(e.target.value)}
                    placeholder={payMethod === 'mpesa' ? '07XX XXX XXX' : '073X XXX XXX'}
                    className="w-full px-4 py-3 rounded-[12px] mb-3 text-[14px]"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(62,207,178,0.3)', color: 'var(--lala-white)', outline: 'none' }} />
                  <button onClick={() => handlePay(payType)} disabled={paying || payPhone.length < 9} className="w-full py-3.5 rounded-[14px] border-none cursor-pointer text-[14px]"
                    style={{ background: paying || payPhone.length < 9 ? 'rgba(62,207,178,0.3)' : 'linear-gradient(135deg, #3ECFB2, #2AA893)', color: '#061412', fontWeight: 800 }}>
                    {paying ? 'Sending STK Push...' : 'Send STK Push - Ksh ' + (payType === 'full' ? Math.round(Number(booking.total_amount)*1.03) : Math.round(Number(booking.total_amount)*0.5)).toLocaleString()}
                  </button>
                </div>
              )}
              {booking.booking_status === 'accepted' && payType && payMethod === 'card' && (
                <div className="px-4 py-4">
                  <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setPayMethod(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lala-muted)', padding: 0 }}>&#8592;</button>
                    <div className="text-[13px]" style={{ color: 'var(--lala-muted)' }}>Card details</div>
                  </div>
                  <input type="text" placeholder="Card number" maxLength={19} className="w-full px-4 py-3 rounded-[12px] mb-2 text-[14px]" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--lala-white)', outline: 'none' }} />
                  <div className="flex gap-2 mb-3">
                    <input type="text" placeholder="MM/YY" maxLength={5} className="flex-1 px-4 py-3 rounded-[12px] text-[14px]" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--lala-white)', outline: 'none' }} />
                    <input type="text" placeholder="CVV" maxLength={3} className="flex-1 px-4 py-3 rounded-[12px] text-[14px]" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--lala-white)', outline: 'none' }} />
                  </div>
                  <button onClick={() => handlePay(payType)} disabled={paying} className="w-full py-3.5 rounded-[14px] border-none cursor-pointer text-[14px]" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', fontWeight: 800 }}>
                    {paying ? 'Processing...' : 'Pay Ksh ' + (payType === 'full' ? Math.round(Number(booking.total_amount)*1.03) : Math.round(Number(booking.total_amount)*0.5)).toLocaleString()}
                  </button>
                </div>
              )}"""
)

print("Done" if "payMethod" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
