import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './PostCardNew.css';

const PostCard = ({ item, type }) => {
  const navigate = useNavigate();
  
  // Determine if it's a destination or adventure based on type or item properties
  const isDestination = type === 'destination' || item.entryFee !== undefined;
  const localKey = 'wishlist_items';

  const readLocalWishlist = () => {
    try {
      const raw = localStorage.getItem(localKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const writeLocalWishlist = (arr) => {
    try { localStorage.setItem(localKey, JSON.stringify(arr)); } catch {}
  };

  const isInLocalWishlist = () => {
    const arr = readLocalWishlist();
    const model = isDestination ? 'Destination' : 'AdventureActivity';
    return arr.some((e) => (e.item?._id || e.item) === item._id && e.itemModel === model);
  };
  
  const [inWishlist, setInWishlist] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!item?._id) return;
    if (!token) {
      // Fallback to local wishlist
      setInWishlist(isInLocalWishlist());
      return;
    }
    const controller = new AbortController();
    const check = async () => {
      try {
        const params = new URLSearchParams({ itemId: item._id, itemType: isDestination ? 'destination' : 'activity' });
        const res = await fetch(`http://localhost:5000/api/wishlist/check?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await res.json();
        if (res.status === 401 && (data?.message || '').toLowerCase().includes('invalid token')) {
          // Clear bad token and use local wishlist state
          localStorage.removeItem('token');
          setInWishlist(isInLocalWishlist());
          return;
        }
        if (data?.success) setInWishlist(!!data.data?.inWishlist);
      } catch {
        // On error, don't block UI
      }
    };
    check();
    return () => controller.abort();
  }, [item?._id, type]);

  const handleCardClick = () => {
    // Navigate to detail page
    if (isDestination) {
      navigate(`/destination/${item._id}`);
    } else {
      navigate(`/adventure/${item._id}`);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }
    
    return stars;
  };

  // Get the image URL with better fallback handling
  const getImageUrl = () => {
    // Check if images array exists and has valid URLs
    if (item.images && item.images.length > 0 && item.images[0]) {
      return item.images[0];
    }
    
    // Use specific fallback images based on destination name/type
    if (isDestination) {
      const name = item.name?.toLowerCase() || '';
      if (name.includes('bridge')) {
        return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&auto=format';
      } else if (name.includes('fort') || name.includes('fortress')) {
        return 'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=400&h=250&fit=crop&auto=format';
      } else if (name.includes('temple') || name.includes('tooth')) {
        return 'https://images.unsplash.com/photo-1599582909646-bbfedc76f768?w=400&h=250&fit=crop&auto=format';
      } else {
        return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&auto=format';
      }
    } else {
      // Adventure fallbacks
      const title = item.title?.toLowerCase() || '';
      if (title.includes('trekking') || title.includes('hiking')) {
        return 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop&auto=format';
      } else if (title.includes('diving') || title.includes('water')) {
        return 'https://images.unsplash.com/photo-1554629947-334ff61d85dc?w=400&h=250&fit=crop&auto=format';
      } else if (title.includes('safari') || title.includes('wildlife')) {
        return 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=250&fit=crop&auto=format';
      } else {
        return 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop&auto=format';
      }
    }
  };

  return (
    <div className="post-card-compact" onClick={handleCardClick}>
      <div className="card-image-container">
        <img 
          src={getImageUrl()}
          alt={isDestination ? item.name : item.title}
          className="card-image"
          loading="lazy"
          onError={(e) => {
            // Fallback if even the Unsplash image fails
            e.target.src = isDestination 
              ? 'https://via.placeholder.com/400x250/1e3c72/ffffff?text=Destination'
              : 'https://via.placeholder.com/400x250/e74c3c/ffffff?text=Adventure';
          }}
        />
        {/* Heart wishlist button */}
        <button
          className={`wishlist-heart-btn ${inWishlist ? 'active' : ''}`}
          aria-label="Add to wishlist"
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={async (e) => {
            e.stopPropagation(); // prevent card navigation
            const token = localStorage.getItem('token');
            if (!token) {
              // Local wishlist toggle
              const model = isDestination ? 'Destination' : 'AdventureActivity';
              const current = readLocalWishlist();
              const exists = current.find((e) => (e.item?._id || e.item) === item._id && e.itemModel === model);
              let next;
              if (exists) {
                next = current.filter((e) => (e.item?._id || e.item) !== item._id || e.itemModel !== model);
              } else {
                // Store a compact snapshot for offline display
                next = [
                  ...current,
                  {
                    _id: `local-${model}-${item._id}`,
                    itemModel: model,
                    item: {
                      _id: item._id,
                      name: item.name,
                      title: item.title,
                      location: item.location,
                      images: item.images,
                      entryFee: item.entryFee,
                      difficulty: item.difficulty,
                    },
                  },
                ];
              }
              writeLocalWishlist(next);
              setInWishlist(!exists);
              if (!exists) {
                toast.success('Added to Wishlist');
              } else {
                toast('Removed from Wishlist', { icon: '💔' });
              }
              return;
            }
            if (busy) return;
            setBusy(true);
            try {
              const endpoint = 'http://localhost:5000/api/wishlist';
              const body = JSON.stringify({ itemId: item._id, itemType: isDestination ? 'destination' : 'activity' });
              const res = await fetch(endpoint, {
                method: inWishlist ? 'DELETE' : 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body,
              });
              const data = await res.json();
              if (res.ok && data?.success) {
                const added = !inWishlist;
                setInWishlist(added);
                if (added) {
                  toast.success('Added to Wishlist');
                } else {
                  toast('Removed from Wishlist', { icon: '💔' });
                }
              } else if (res.status === 401 && (data?.message || '').toLowerCase().includes('invalid token')) {
                // Token invalid — fallback to local wishlist
                localStorage.removeItem('token');
                const model = isDestination ? 'Destination' : 'AdventureActivity';
                const current = readLocalWishlist();
                const exists = current.find((e) => (e.item?._id || e.item) === item._id && e.itemModel === model);
                let next;
                if (exists) {
                  next = current.filter((e) => (e.item?._id || e.item) !== item._id || e.itemModel !== model);
                } else {
                  next = [
                    ...current,
                    {
                      _id: `local-${model}-${item._id}`,
                      itemModel: model,
                      item: {
                        _id: item._id,
                        name: item.name,
                        title: item.title,
                        location: item.location,
                        images: item.images,
                        entryFee: item.entryFee,
                        difficulty: item.difficulty,
                      },
                    },
                  ];
                }
                writeLocalWishlist(next);
                setInWishlist(!exists);
                if (!exists) {
                  toast.success('Added to Wishlist');
                } else {
                  toast('Removed from Wishlist', { icon: '💔' });
                }
              } else {
                alert(data?.message || 'Wishlist action failed');
              }
            } catch (err) {
              alert('Network error, please try again.');
            } finally {
              setBusy(false);
            }
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill={inWishlist ? '#ff3b3b' : 'none'} stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <div className={`card-type-badge ${isDestination ? 'destination-badge' : 'adventure-badge'}`}>
          {isDestination ? 'Destination' : 'Adventure'}
        </div>
        {item.difficulty && (
          <div className={`difficulty-badge difficulty-${item.difficulty?.toLowerCase()}`}>
            {item.difficulty}
          </div>
        )}
      </div>
      
      <div className="card-content-compact">
        <h3 className="card-title-compact">{isDestination ? item.name : item.title}</h3>
        
        <div className="card-location-compact">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
          </svg>
          {item.location}
        </div>
        
        <div className="card-rating-compact">
          <div className="stars">
            {renderStars(4)}
          </div>
          <span className="rating-text">(4)</span>
        </div>
        
        <button className={`see-more-btn ${isDestination ? 'destination-btn' : 'adventure-btn'}`}>
          <span>See More</span>
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
