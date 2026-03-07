# -*- coding: utf-8 -*-
lines = open("src/app/pages/Map.tsx", encoding="utf-8").readlines()
lines[901] = "            { cat: 'stays',     icon: '🏠', label: 'BnBs',     color: '#E8B86D' },
"
lines[902] = "            { cat: 'hospital',  icon: '🏥', label: 'Hospital', color: '#FF6B6B' },
"
lines[903] = "            { cat: 'transport', icon: '✈️', label: 'Airport',  color: '#A29BFE' },
"
lines[904] = "            { cat: 'mall',      icon: '🛍️', label: 'Mall',     color: '#FF9F43' },
"
lines[905] = "            { cat: 'education', icon: '🎓', label: 'Uni',      color: '#74B9FF' },
"
lines[906] = "            { cat: 'nature',    icon: '🌿', label: 'Nature',   color: '#3ECFB2' },
"
lines[907] = "            { cat: 'area',      icon: '🏘️', label: 'Areas',    color: '#FD79A8' },
"
open("src/app/pages/Map.tsx", "w", encoding="utf-8").writelines(lines)
print("done")
