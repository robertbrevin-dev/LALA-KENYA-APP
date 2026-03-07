# -*- coding: utf-8 -*-
c = open('src/app/components/PropertyCard.tsx', encoding='utf-8').read()
old = '{property.image}'
new = '{property.image?.startsWith("http") ? <img src={property.image} alt={property.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} /> : <span>{property.image || ""}</span>}'
result = c.replace(old, new, 1)
open('src/app/components/PropertyCard.tsx', 'w', encoding='utf-8').write(result)
print('done' if result != c else 'ERROR')
