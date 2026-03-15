# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "        console.log('INCOMING CALL PAYLOAD:', call);\n        if (call.call_status === 'ringing') {\n          const { data: caller } = await supabase.from('profiles').select('full_name').eq('id', call.caller_id).maybeSingle();\n          setIncomingCall({ ...call, caller_name: caller?.full_name || 'Unknown' });\n        }",
    "        console.log('INCOMING CALL PAYLOAD:', call, 'status:', call.call_status);\n        const { data: caller } = await supabase.from('profiles').select('full_name').eq('id', call.caller_id).maybeSingle();\n        console.log('CALLER NAME:', caller?.full_name);\n        setIncomingCall({ ...call, caller_name: caller?.full_name || 'Unknown' });\n        console.log('incomingCall SET');"
)

print("Done" if "incomingCall SET" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
