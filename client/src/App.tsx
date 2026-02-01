import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CodeGenerator from './pages/CodeGenerator';
import CodeReview from './pages/CodeReview';
import Debugger from './pages/Debugger';
import Documentation from './pages/Documentation';
import TestGenerator from './pages/TestGenerator';
import Chat from './pages/Chat';
import Projects from './pages/Projects';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="generate" element={<CodeGenerator />} />
        <Route path="review" element={<CodeReview />} />
        <Route path="debug" element={<Debugger />} />
        <Route path="docs" element={<Documentation />} />
        <Route path="tests" element={<TestGenerator />} />
        <Route path="chat" element={<Chat />} />
        <Route path="projects" element={<Projects />} />
      </Route>
    </Routes>
  );
}

export default App;
