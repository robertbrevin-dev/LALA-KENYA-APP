# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Fix wrong import paths
c = c.replace(
    "import('./utils/notify')",
    "import('../utils/notify')"
)
c = c.replace(
    "import('./utils/notify' as any)",
    "import('../utils/notify')"
)
c = c.replace(
    "import { supabase } from '../lib/supabase';\nimport { sendNotification } from '../app/utils/notify';",
    "import { supabase } from '../lib/supabase';"
)

print("Done" if "./utils/notify" not in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
