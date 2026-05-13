import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import EmbedBrowser from './components/EmbedBrowser';
import NewItemModal from './components/NewItemModal';
import { Item, Flow, Actor, Tool } from './types';
import Dashboard from './views/Dashboard';
import ItemBoard from './views/ItemBoard';
import ItemDetail from './views/ItemDetail';
import FlowList from './views/FlowList';
import FlowEditor from './views/FlowEditor';
import ActorManager from './views/ActorManager';
import ToolManager from './views/ToolManager';
import { api } from './services/api';

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [flows, setFlows] = useState<Record<string, Flow>>({});
  const [actors, setActors] = useState<Record<string, Actor>>({});
  const [tools, setTools] = useState<Record<string, Tool>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<'dashboard' | 'board' | 'detail' | 'flow-list' | 'flow-editor' | 'actor-manager' | 'tool-manager'>('dashboard');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  const navigateContent = (path: string, push = true) => {
    if (push) {
      window.history.pushState({}, '', path);
    }
    
    if (path === '/' || path === '') setCurrentView('dashboard');
    else if (path === '/board') setCurrentView('board');
    else if (path.startsWith('/items/')) {
      setSelectedItemId(path.split('/')[2]);
      setCurrentView('detail');
    }
    else if (path === '/flows') setCurrentView('flow-list');
    else if (path.startsWith('/flows/')) {
      setSelectedFlowId(path.split('/')[2]);
      setCurrentView('flow-editor');
    }
    else if (path === '/actors') setCurrentView('actor-manager');
    else if (path === '/tools') setCurrentView('tool-manager');
  };

  useEffect(() => {
    const handlePopState = () => {
      navigateContent(window.location.pathname, false);
    };
    window.addEventListener('popstate', handlePopState);
    // don't push on initial load, just parse URL
    navigateContent(window.location.pathname, false);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const changeView = (view: typeof currentView) => {
    if (view === 'board') navigateContent('/board');
    else if (view === 'dashboard') navigateContent('/');
    else if (view === 'flow-list') navigateContent('/flows');
    else if (view === 'actor-manager') navigateContent('/actors');
    else if (view === 'tool-manager') navigateContent('/tools');
    else if (view === 'detail' && selectedItemId) navigateContent(`/items/${selectedItemId}`);
    else if (view === 'flow-editor' && selectedFlowId) navigateContent(`/flows/${selectedFlowId}`);
  };
  const [embedBrowser, setEmbedBrowser] = useState<{ url: string; title: string } | null>(null);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [itemsRes, flowsRes, actorsRes, toolsRes] = await Promise.all([
          api.items.list(),
          api.flows.list(),
          api.actors.list(),
          api.tools.list(),
        ]);
        setItems(itemsRes.data);
        
        const flowRecord: Record<string, Flow> = {};
        flowsRes.data.forEach(f => {
          flowRecord[f.id] = f;
        });
        setFlows(flowRecord);
        
        const actorRecord: Record<string, Actor> = {};
        actorsRes.data.forEach(a => {
          actorRecord[a.id] = a;
        });
        setActors(actorRecord);

        const toolRecord: Record<string, Tool> = {};
        toolsRes.data.forEach(t => {
          toolRecord[t.id] = t;
        });
        setTools(toolRecord);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const navigateToItem = (id: string) => {
    navigateContent(`/items/${id}`);
  };

  const handleUpdateItem = async (updatedItem: Item) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    try {
      await api.items.update(updatedItem.id, updatedItem);
    } catch (err: any) {
      setError(err.message || 'Failed to update item');
      // In a real app we'd revert the bold update here
    }
  };

  const handleCreateItem = async (name: string, thumbnailUrl: string, flowId: string) => {
    try {
      const res = await api.items.create({ name, thumbnailUrl, flowId });
      setItems((prev) => [res.data, ...prev]);
      setIsNewItemModalOpen(false);
      navigateToItem(res.data.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create item');
    }
  };

  const navigateToFlow = (id: string | null) => {
    if (id) {
      navigateContent(`/flows/${id}`);
    } else {
      navigateContent('/flows');
    }
  };

  const handleCreateFlow = async () => {
    try {
      const res = await api.flows.create({
        name: '새 워크플로우',
        description: '',
        stereo: 'linear',
        stages: []
      });
      setFlows(prev => ({ ...prev, [res.data.id]: res.data }));
      navigateToFlow(res.data.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create flow');
    }
  };

  const handleUpdateFlow = async (updated: Flow) => {
    // Optimistic Update
    setFlows(prev => ({ ...prev, [updated.id]: updated }));
    try {
      await api.flows.update(updated.id, {
        name: updated.name,
        description: updated.description,
        stages: updated.stages
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update flow');
    }
  };

  const handleTestApplyFlow = async () => {
    if (!selectedFlowId) return;
    const selectedFlow = flows[selectedFlowId];
    if (!selectedFlow) return;

    try {
      const res = await api.flows.apply(selectedFlowId, {
        name: `[테스트] ${selectedFlow.name} 상품`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=200&h=200',
        flowId: selectedFlowId
      });
      setItems((prev) => [res.data, ...prev]);
      navigateToItem(res.data.id);
    } catch (err: any) {
      setError(err.message || 'Failed to apply test flow');
    }
  };

  const handleCreateActor = async (input: Partial<Actor>) => {
    try {
      const res = await api.actors.create(input);
      if (res.warnings?.length) alert(res.warnings.join('\n'));
      setActors(prev => ({ ...prev, [res.data.id]: res.data }));
    } catch (err: any) {
      setError(err.message || 'Failed to create actor');
    }
  };

  const handleUpdateActor = async (id: string, input: Partial<Actor>) => {
    try {
      const res = await api.actors.update(id, input);
      setActors(prev => ({ ...prev, [id]: res.data }));
    } catch (err: any) {
      setError(err.message || 'Failed to update actor');
    }
  };

  const handleDeactivateActor = async (id: string) => {
    try {
      const res = await api.actors.deactivate(id);
      setActors(prev => ({ ...prev, [id]: res.data }));
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate actor');
    }
  };

  const handleActivateActor = async (id: string) => {
    try {
      const res = await api.actors.activate(id);
      setActors(prev => ({ ...prev, [id]: res.data }));
    } catch (err: any) {
      setError(err.message || 'Failed to activate actor');
    }
  };

  const handleCreateTool = async (input: Partial<Tool>) => {
    try {
      const res = await api.tools.create(input);
      if (res.warnings?.length) alert(res.warnings.join('\n'));
      setTools(prev => ({ ...prev, [res.data.id]: res.data }));
    } catch (err: any) {
      setError(err.message || 'Failed to create tool');
    }
  };

  const handleUpdateTool = async (id: string, input: Partial<Tool>) => {
    try {
      const res = await api.tools.update(id, input);
      if (res.warnings?.length) alert(res.warnings.join('\n'));
      setTools(prev => ({ ...prev, [id]: res.data }));
    } catch (err: any) {
      setError(err.message || 'Failed to update tool');
    }
  };

  const handleDeactivateTool = async (id: string) => {
    try {
      const res = await api.tools.deactivate(id);
      setTools(prev => ({ ...prev, [id]: res.data }));
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate tool');
    }
  };

  const handleActivateTool = async (id: string) => {
    try {
      const res = await api.tools.activate(id);
      setTools(prev => ({ ...prev, [id]: res.data }));
    } catch (err: any) {
      setError(err.message || 'Failed to activate tool');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">로딩 중...</div>;
  }

  const selectedItem = items.find((item) => item.id === selectedItemId);
  const selectedFlow = selectedFlowId ? flows[selectedFlowId] : undefined;

  return (
    <>
      {error && (
        <div className="fixed top-4 right-4 z-[9999] bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 shadow-md">
          <p className="text-sm font-semibold">{error}</p>
          <button onClick={() => setError(null)} className="absolute top-1/2 -translate-y-1/2 right-2 p-1 hover:bg-red-100 rounded">
             &times;
          </button>
        </div>
      )}
      <Layout 
        currentView={currentView} 
        setCurrentView={changeView}
        onBack={() => changeView('board')}
        onNewItem={() => setIsNewItemModalOpen(true)}
      >
        {currentView === 'dashboard' && (
          <Dashboard items={items} onNavigateToItem={navigateToItem} actors={actors} />
        )}
        {currentView === 'board' && (
          <ItemBoard items={items} onNavigateToItem={navigateToItem} actors={actors} />
        )}
        {currentView === 'detail' && selectedItem && (
          <ItemDetail 
            item={selectedItem} 
            onUpdateItem={handleUpdateItem} 
            onOpenEmbed={(url, title) => setEmbedBrowser({ url, title })}
            onNavigateToFlow={navigateToFlow}
            actors={actors}
            tools={tools}
          />
        )}
        {currentView === 'flow-list' && (
          <FlowList 
            flows={flows} 
            onNavigateToFlow={navigateToFlow} 
            onCreateFlow={handleCreateFlow} 
          />
        )}
        {currentView === 'flow-editor' && selectedFlow && (
          <FlowEditor 
            flow={selectedFlow} 
            onUpdateFlow={handleUpdateFlow} 
            onBack={() => navigateToFlow(null)}
            onTestApply={handleTestApplyFlow}
            actors={actors}
            tools={tools}
          />
        )}
        {currentView === 'actor-manager' && (
          <ActorManager
            actors={actors}
            onCreateActor={handleCreateActor}
            onUpdateActor={handleUpdateActor}
            onDeactivateActor={handleDeactivateActor}
            onActivateActor={handleActivateActor}
          />
        )}
        {currentView === 'tool-manager' && (
          <ToolManager
            tools={tools}
            flows={Object.values(flows)}
            items={items}
            onCreateTool={handleCreateTool}
            onUpdateTool={handleUpdateTool}
            onDeactivateTool={handleDeactivateTool}
            onActivateTool={handleActivateTool}
          />
        )}
      </Layout>
      
      {isNewItemModalOpen && (
        <NewItemModal 
          flows={flows}
          onClose={() => setIsNewItemModalOpen(false)}
          onSubmit={handleCreateItem}
        />
      )}

      {embedBrowser && (
        <EmbedBrowser 
          url={embedBrowser.url} 
          title={embedBrowser.title} 
          onClose={() => setEmbedBrowser(null)} 
        />
      )}
    </>
  );
}

