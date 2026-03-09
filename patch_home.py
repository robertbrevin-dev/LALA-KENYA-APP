# -*- coding: utf-8 -*-
c = open("src/app/pages/Home.tsx", encoding="utf-8").read()

old1 = """            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="border-none bg-transparent cursor-pointer text-[16px]"
                style={{ color: 'rgba(255,255,255,0.3)' }}>×</button>
            )}
          </motion.div>"""

new1 = """            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="border-none bg-transparent cursor-pointer text-[16px]"
                style={{ color: "rgba(255,255,255,0.3)" }}>×</button>
            )}
            <button onClick={() => setAgentOpen(true)} className="border-none cursor-pointer flex items-center justify-center flex-shrink-0" style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#E8B86D,#C8903D)", boxShadow:"0 0 0 3px rgba(232,184,109,0.15),0 0 14px rgba(232,184,109,0.35)", fontSize:15 }} title="Ask LALA AI">🏙️</button>
          </motion.div>"""

result = c.replace(old1, new1, 1)

old2 = "  const [searchQuery, setSearchQuery] = useState(\'\');"
new2 = """  const [searchQuery, setSearchQuery] = useState(\'\');
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentMessages, setAgentMessages] = useState<{role:string;text:string;cards?:any[]}[]>([{role:\'agent\',text:\'Habari! I am LALA Concierge, your personal stay assistant. Tell me what you need: location, budget, vibe. I speak English and Swahili.\'}]);
  const [agentInput, setAgentInput] = useState(\'\');
  const [agentLoading, setAgentLoading] = useState(false);"""

result = result.replace("  const [searchQuery, setSearchQuery] = useState(\'\');", new2, 1)

open("src/app/pages/Home.tsx", "w", encoding="utf-8").write(result)
print("mic:" + str("agentOpen" in result))
