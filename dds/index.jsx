import React, { useState } from 'react';
import { Menu, X, Home, Mail, MessageSquare, Bird, Briefcase, User, Hash, FileText, Settings, BookOpen } from 'lucide-react';

export default function BPSSystem() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  const connectedCases = [
    { id: 1, title: 'Case #001', status: 'Active' },
    { id: 2, title: 'Case #002', status: 'In Progress' },
  ];

  const notConnectedCases = [
    { id: 3, title: 'Case #003', status: 'Locked' },
    { id: 4, title: 'Case #004', status: 'Locked' },
  ];

  const menuItems = [
    { icon: Briefcase, label: 'CASE', description: 'この世界に迷い込んだ物語を、あなたの手で解決に導いてください。', page: 'case' },
    { icon: User, label: 'PROFILE', description: '交錯員アカウントの情報を確認し、登録内容や進行状況を管理することができます。', page: 'profile' },
    { icon: Hash, label: 'SERIAL CODE', description: '新たな扉を解放するためのシリアルコード入力機能です。', page: 'serial' },
    { icon: FileText, label: 'REPORT', description: '物語の調査を完了された交錯員は、以下よりラストワードを入力ください。', page: 'report' },
    { icon: Settings, label: 'SETTINGS', description: 'メールアドレスやパスワード、ゲームモードの変更などが行えます。', page: 'settings' },
    { icon: BookOpen, label: 'MANUAL', description: '「BPS」の機能や使用方法などの確認が行えます。', page: 'manual' },
  ];

  return (
    <div className="min-h-screen bg-black text-gray-300 font-mono">
      {/* Header */}
      <header className="border-b border-cyan-500/30 bg-black/95 backdrop-blur-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-cyan-400 font-bold text-xl tracking-wider">
              <span className="text-2xl">BPS</span>
              <div className="text-xs text-cyan-500/70">BOUNDARY PRINCIPLE SYSTEM</div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-cyan-400 text-sm">Dual Strider</span>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/95 z-40 pt-20">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setCurrentPage(item.page);
                    setMenuOpen(false);
                  }}
                  className="border border-cyan-500/30 p-6 text-left hover:border-cyan-400 hover:bg-cyan-500/5 transition-all group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <item.icon className="text-cyan-400 group-hover:text-cyan-300" size={24} />
                    <span className="text-cyan-400 font-bold group-hover:text-cyan-300">{item.label}</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="fixed top-16 left-0 right-0 bg-black/90 border-b border-cyan-500/20 z-30">
        <div className="max-w-7xl mx-auto px-4 py-2 flex gap-8 overflow-x-auto">
          <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 whitespace-nowrap py-2">
            <Home size={16} />
            <span className="text-xs">HOME</span>
          </button>
          <button className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 whitespace-nowrap py-2">
            <Mail size={16} />
            <span className="text-xs">D4-MAIL</span>
          </button>
          <button className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 whitespace-nowrap py-2">
            <MessageSquare size={16} />
            <span className="text-xs">D4-MESSAGE</span>
          </button>
          <button className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 whitespace-nowrap py-2">
            <Bird size={16} />
            <span className="text-xs">D4-BIRD</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-16">
            <div className="inline-block border-2 border-cyan-500/50 p-8 mb-6">
              <div className="text-6xl font-bold text-cyan-400 mb-2">BPS</div>
              <div className="text-xs text-cyan-500/70 tracking-widest">境界律システム</div>
            </div>
            <h1 className="text-3xl text-cyan-400 mb-2">Welcome, Dual Strider</h1>
            <div className="inline-block px-6 py-2 border border-green-500/50 bg-green-500/10 text-green-400 text-sm">
              ● CONNECTED
            </div>
          </div>

          {/* Cases Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Connected Cases */}
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-cyan-500/30">
                <h2 className="text-cyan-400 font-bold">CONNECTED</h2>
                <button className="text-xs text-cyan-500 hover:text-cyan-400">VIEW ALL</button>
              </div>
              <div className="space-y-3">
                {connectedCases.map((case_) => (
                  <div key={case_.id} className="border border-cyan-500/30 p-4 hover:border-cyan-400 hover:bg-cyan-500/5 transition-all cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 group-hover:text-cyan-300">{case_.title}</span>
                      <span className="text-xs text-green-400">{case_.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Not Connected Cases */}
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-cyan-500/30">
                <h2 className="text-cyan-400 font-bold">NOT CONNECTED</h2>
                <button className="text-xs text-cyan-500 hover:text-cyan-400">VIEW ALL</button>
              </div>
              <div className="space-y-3">
                {notConnectedCases.map((case_) => (
                  <div key={case_.id} className="border border-gray-700 p-4 opacity-50">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">{case_.title}</span>
                      <span className="text-xs text-gray-600">{case_.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Options Grid */}
          <div>
            <h2 className="text-cyan-400 font-bold text-xl mb-6 pb-2 border-b border-cyan-500/30">OPTIONS</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setCurrentPage(item.page)}
                  className="border border-cyan-500/30 p-6 text-left hover:border-cyan-400 hover:bg-cyan-500/5 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <item.icon className="text-cyan-400 group-hover:text-cyan-300" size={28} />
                    <span className="text-cyan-400 font-bold group-hover:text-cyan-300 text-lg">{item.label}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-500/30 bg-black/95 fixed bottom-0 w-full">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-gray-600">©第四境界／D4KK</div>
          <div className="flex gap-6">
            <button className="text-cyan-500 hover:text-cyan-400 transition-colors">
              <Home size={18} />
            </button>
            <button className="text-gray-600 hover:text-cyan-400 transition-colors">
              <Briefcase size={18} />
            </button>
            <button className="text-gray-600 hover:text-cyan-400 transition-colors">
              <User size={18} />
            </button>
            <button className="text-gray-600 hover:text-cyan-400 transition-colors">
              <Hash size={18} />
            </button>
          </div>
        </div>
      </footer>

      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
    </div>
  );
}
