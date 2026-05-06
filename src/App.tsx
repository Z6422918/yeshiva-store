import { useStore } from './store/useStore';
import Login from './components/Login';
import Layout from './components/Layout';

export default function App() {
  const currentUser = useStore(s => s.currentUser);
  return currentUser ? <Layout /> : <Login />;
}
