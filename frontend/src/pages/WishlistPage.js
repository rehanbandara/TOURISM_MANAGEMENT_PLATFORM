import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './WishlistPage.css';

const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const localKey = 'wishlist_items';
    if (!token) {
      // Use local wishlist
      try {
        const raw = localStorage.getItem(localKey);
        const arr = raw ? JSON.parse(raw) : [];
        setItems(arr);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
      return;
    }
    const fetchWishlist = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/wishlist/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.status === 401 && (data?.message || '').toLowerCase().includes('invalid token')) {
          // fallback to localStorage and clear token
          localStorage.removeItem('token');
          const raw = localStorage.getItem('wishlist_items');
          const arr = raw ? JSON.parse(raw) : [];
          setItems(arr);
          return;
        }
        if (res.ok && data?.success) {
          setItems(data.data || []);
        } else {
          setError(data?.message || 'Failed to load wishlist');
        }
      } catch (err) {
        setError('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const goToItem = (entry) => {
    const isDestination = entry.itemModel === 'Destination' || entry.item?.entryFee !== undefined;
    if (isDestination) {
      navigate(`/destination/${entry.item?._id || entry.item}`);
    } else {
      navigate(`/adventure/${entry.item?._id || entry.item}`);
    }
  };

  const imageOf = (entry) => {
    const it = entry.item || {};
    return it.images?.[0] || 'https://via.placeholder.com/120x80?text=Item';
  };

  const removeLocal = (entry) => {
    try {
      const raw = localStorage.getItem('wishlist_items');
      const arr = raw ? JSON.parse(raw) : [];
      const id = entry.item?._id || entry.item;
      const model = entry.itemModel;
      const next = arr.filter(e => (e.item?._id || e.item) !== id || e.itemModel !== model);
      localStorage.setItem('wishlist_items', JSON.stringify(next));
    } catch {}
  };

  const removeEntry = async (entry) => {
    const token = localStorage.getItem('token');
    const id = entry.item?._id || entry.item;
    const itemType = entry.itemModel === 'Destination' ? 'destination' : 'activity';
    if (!token) {
      removeLocal(entry);
      setItems(prev => prev.filter(e => e._id !== entry._id));
      toast('Removed from Wishlist', { icon: '💔' });
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId: id, itemType })
      });
      const data = await res.json();
      if (res.status === 401 && (data?.message || '').toLowerCase().includes('invalid token')) {
        localStorage.removeItem('token');
        removeLocal(entry);
        setItems(prev => prev.filter(e => e._id !== entry._id));
        toast('Removed from Wishlist', { icon: '💔' });
        return;
      }
      if (res.ok && data?.success) {
        setItems(prev => prev.filter(e => e._id !== entry._id));
        toast('Removed from Wishlist', { icon: '💔' });
      } else {
        toast.error(data?.message || 'Failed to remove');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <div>
          <h2>My Wishlist</h2>
          <p className="wishlist-subtitle">Saved destinations and adventures you love</p>
        </div>
        <div className="wishlist-meta">
          {!loading && (
            <span className="count-badge">{items.length}</span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="wishlist-grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="wishlist-card skeleton" />
          ))}
        </div>
      ) : error ? (
        <div className="wishlist-empty">
          <div className="icon">⚠️</div>
          <h3>We couldn’t load your wishlist</h3>
          <p>{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="wishlist-empty">
          <div className="icon">💖</div>
          <h3>Your wishlist is empty</h3>
          <p>Tap the heart on a destination or adventure to save it here.</p>
          <button className="browse-btn" onClick={() => navigate('/destinations')}>Browse Destinations</button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map((entry) => (
            <div key={entry._id} className="wishlist-card">
              <div className="card-media" onClick={() => goToItem(entry)}>
                <img src={imageOf(entry)} alt="Wishlist item" />
                <div className={`type-pill ${entry.itemModel === 'Destination' ? 'dest' : 'adv'}`}>
                  {entry.itemModel === 'Destination' ? 'Destination' : 'Adventure'}
                </div>
              </div>
              <div className="card-body">
                <h3 className="card-title" title={entry.item?.name || entry.item?.title || 'Unknown'}>
                  {entry.item?.name || entry.item?.title || 'Unknown'}
                </h3>
                <div className="card-meta">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                  </svg>
                  <span>{entry.item?.location || 'Unknown'}</span>
                </div>
                <div className="card-actions">
                  <button className="btn view" onClick={() => goToItem(entry)}>
                    View
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                  </button>
                  <button className="btn remove" onClick={() => removeEntry(entry)}>
                    Remove
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2H5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1h2.5a1 1 0 0 1 1 1zM5 4v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H5z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
