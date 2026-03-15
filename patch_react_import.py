# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Fix import to include useRef and useState
c = c.replace(
    "import { useState, useEffect, useRef } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';"
)
# Also replace React.useRef and React.useState with proper hooks
c = c.replace(
    "  const localVideoRef = React.useRef<HTMLVideoElement>(null);",
    "  const localVideoRef = useRef<HTMLVideoElement>(null);"
)
c = c.replace(
    "  const [localStream, setLocalStream] = React.useState<MediaStream|null>(null);",
    "  const [localStream, setLocalStream] = useState<MediaStream|null>(null);"
)

print("Done" if "import React" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
