import random,sys
random.seed(11)
W,H=1600,560; ph=80
tones=[(0.50,0.31,0.18),(0.46,0.28,0.16),(0.55,0.36,0.22),(0.42,0.26,0.15),(0.52,0.33,0.20)]
o=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">','<defs>']
planks=[];y=0;n=0
while y<H:
    x=-random.randint(0,900)
    while x<W:
        L=random.choice([700,820,940,1220]); planks.append((x,y,L,n)); x+=L; n+=1
    y+=ph
for x,y,L,i in planks:
    r,g,b=random.choice(tones); fx=random.uniform(.0018,.0035); fy=random.uniform(.07,.12)
    o.append(f'<filter id="p{i}" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse"><feTurbulence type="fractalNoise" baseFrequency="{fx:.4f} {fy:.3f}" numOctaves="4" seed="{i+1}"/><feColorMatrix type="matrix" values="0 0 0 .5 {r-.2:.3f}  0 0 0 .38 {g-.15:.3f}  0 0 0 .26 {b-.1:.3f}  0 0 0 0 1"/></filter>')
o.append('</defs>')
for x,y,L,i in planks:
    o.append(f'<rect x="{x}" y="{y}" width="{L}" height="{ph}" filter="url(#p{i})"/>')
for x,y,L,i in planks:
    o.append(f'<rect x="{x+.75}" y="{y+.75}" width="{L-1.5}" height="{ph-1.5}" fill="none" stroke="#2a170b" stroke-opacity=".6" stroke-width="1.5"/>')
o.append('</svg>'); open(sys.argv[1],"w").write("\n".join(o))
