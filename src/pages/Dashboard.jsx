import GlobalFilters from '@/components/GlobalFilters';
import VisaoGeralTab from '@/components/tabs/VisaoGeralTab';
import ProdutosTab from '@/components/tabs/ProdutosTab';
import LojasTab from '@/components/tabs/LojasTab';
import ServicosTab from '@/components/tabs/ServicosTab';
import EstoqueTab from '@/components/tabs/EstoqueTab';
import PrevisibilidadeTab from '@/components/tabs/PrevisibilidadeTab';
import DesempenhoTab from '@/components/tabs/DesempenhoTab';
import PrecificacaoTab from '@/components/tabs/PrecificacaoTab';
import CestaComprasTab from '@/components/tabs/CestaComprasTab';
import './Dashboard.css';

// ÍCONES SVG DA APLICAÇÃO
const Icons = {
  Home: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  Box: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  Map: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  Credit: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
  Layers: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>,
  Trending: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
  Target: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>,
  Tag: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>,
  Cart: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>

};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [printSection, setPrintSection] = useState(null);
  const isPrinting = printSection !== null;

  const handlePrint = (sectionId) => {
    setPrintSection(sectionId);
    setTimeout(() => { window.print(); setPrintSection(null); }, 400); 
  };
  
  const printProps = {
    printSection, isPrinting, handlePrint,
    getPrintClass: (id) => (isPrinting && printSection === id ? 'print-active' : (isPrinting ? 'no-print' : ''))
  };

  const salesData = useSalesData();

  const menus = [
    { id: 'visao-geral', label: 'Visão Geral', icon: <Icons.Home /> },
    { id: 'produtos', label: 'Produtos & Categorias', icon: <Icons.Box /> },
    { id: 'lojas', label: 'Lojas & Cidades', icon: <Icons.Map /> },
    { id: 'precificacao', label: 'Precificação & Descontos', icon: <Icons.Tag /> },
    { id: 'cesta', label: 'Cesta de Compras', icon: <Icons.Cart /> },
    { id: 'estoque', label: 'Estoque / Inventário', icon: <Icons.Layers /> },
    { id: 'previsibilidade', label: 'Previsibilidade ABC', icon: <Icons.Trending /> },
    { id: 'desempenho', label: 'Gestão & Desempenho', icon: <Icons.Target /> },
    { id: 'servicos', label: 'Serviços Financeiros', icon: <Icons.Credit /> }
  ];

  return (
    <div className={`app-layout ${isPrinting ? 'is-printing' : ''}`}>
      <aside className="sidebar no-print">
        <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', flexDirection: 'column', justifyContent: 'center'  }}>
          <div className="logo-icon" style={{ width: '100%', height: '80px',padding: '0.5rem' }}>
           <img src="/logo.png" alt="DataDash Logo" style={{ height: '100%', objectFit: 'contain' }} />
          </div>
          <h2 className="logo-text">Laser Comercial</h2>
        </div>
        <nav className="nav-menu">
          {menus.map(menu => (
            <button key={menu.id} className={`nav-item ${activeTab === menu.id ? 'active' : ''}`} onClick={() => setActiveTab(menu.id)}>
              {menu.icon} {menu.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="main-wrapper">
        <header className="top-bar no-print">
          <div className="welcome-text">
            <h1>Olá, Gestor</h1>
            <p>Explore as informações e atividades da rede.</p>
          </div>
          <GlobalFilters salesData={salesData} />
        </header>

        <main className="content-scroll">
          {salesData.data.length === 0 && salesData.inventoryData.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              <h2>Importe um arquivo de Vendas ou Estoque no cabeçalho para iniciar.</h2>
            </div>
          ) : (
            <>
              {activeTab === 'visao-geral' && salesData.data.length > 0 && <VisaoGeralTab salesData={salesData} printProps={printProps} />}
              {activeTab === 'produtos' && salesData.data.length > 0 && <ProdutosTab salesData={salesData} printProps={printProps} />}
              {activeTab === 'lojas' && salesData.data.length > 0 && <LojasTab salesData={salesData} printProps={printProps} />}
              {activeTab === 'precificacao' && <PrecificacaoTab salesData={salesData} printProps={printProps} />}
              {activeTab === 'cesta' && <CestaComprasTab salesData={salesData} printProps={printProps} />}
              {activeTab === 'estoque' && <EstoqueTab salesData={salesData} printProps={printProps} />}
              {activeTab === 'previsibilidade' && <PrevisibilidadeTab salesData={salesData} printProps={printProps} />}
              {activeTab === 'desempenho' && <DesempenhoTab salesData={salesData} printProps={printProps} />}
              {activeTab === 'servicos' && salesData.data.length > 0 && <ServicosTab salesData={salesData} printProps={printProps} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}