import { Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

const items = [
  { label: 'Home', key: 'home', path: '/' },
  { label: 'Basic', key: 'basic', path: '/basic' },
  { label: 'Read Only', key: 'read-only', path: '/read-only' },
  { label: 'Add More', key: 'add-more', path: '/add-more' },
];

function Slider() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activePath = pathname?.split('/')[1] || 'home';
  return <Menu selectedKeys={[activePath]} items={items.map(i => ({ ...i, onClick: () => navigate(i.path) }))} />;
}

export default Slider;
