import React, { useState } from 'react';
import { MapPin, ShoppingCart, Phone, Clock, Flame, ArrowLeft, Navigation } from 'lucide-react';

const App = () => {
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState('menu'); // 'menu' or 'cart'
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [deliveryLocation, setDeliveryLocation] = useState({ lat: '', lng: '' });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  
  const warungLocation = { lat: -6.178059, lng: 106.158745 }; // Contoh lokasi Bandung
  
  const menuItems = [
    {
      category: 'Aneka Nasi Goreng',
      items: [
        { id: 1, name: 'Nasi Goreng Biasa', price: 10000, bonus: 'Es/Panas' },
        { id: 2, name: 'Nasi Goreng Ayam Suwir', price: 14000, bonus: 'Es/Panas' },
        { id: 3, name: 'Nasi Goreng Telur Dadar', price: 13000, bonus: 'Es/Panas' }
      ]
    },
    {
      category: 'Aneka Nasi Putih',
      items: [
        { id: 4, name: 'Nasi Pecel Ayam', price: 10000 },
        { id: 5, name: 'Nasi Telur Dadar', price: 8000 },
        { id: 6, name: 'Nasi Ayam Geprek', price: 10000 }
      ]
    },
    {
      category: 'Mie & Baso',
      items: [
        { id: 7, name: 'Mie', price: 5000 },
        { id: 8, name: 'Mie Telur', price: 8000 },
        { id: 9, name: 'Mie + Baso Ikan', price: 8000 },
        { id: 10, name: 'Baso Ikan', price: 5000 }
      ]
    },
    {
      category: 'Minuman',
      items: [
        { id: 11, name: 'Es Teajus', price: 2000 },
        { id: 12, name: 'Es Pop Ice', price: 3000 },
        { id: 13, name: 'Teh Manis Panas', price: 2000 },
        { id: 14, name: 'Teh Tawar Panas', price: 1000 },
        { id: 15, name: 'Kopi Panas', price: 3000 }
      ]
    }
  ];

  const spiceLevels = [
    { id: 1, name: 'Tidak Pedas', icon: '😊' },
    { id: 2, name: 'Sedang', icon: '🌶️' },
    { id: 3, name: 'Pedas', icon: '🌶️🌶️' },
    { id: 4, name: 'Pedas Maximal', icon: '🔥🔥🔥' }
  ];

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1, spiceLevel: null, drink: null }]);
    }
  };

  const updateQuantity = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const updateSpiceLevel = (id, level) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, spiceLevel: level } : item
    ));
  };

  const updateDrink = (id, drink) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, drink: drink } : item
    ));
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDeliveryLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsGettingLocation(false);
        },
        () => {
          alert('Tidak dapat mengakses lokasi. Pastikan izin lokasi sudah diaktifkan.');
          setIsGettingLocation(false);
        }
      );
    } else {
      alert('Browser tidak mendukung geolocation');
      setIsGettingLocation(false);
    }
  };

  const calculateDistance = () => {
    if (!deliveryLocation.lat || !deliveryLocation.lng) return 0;
    const R = 6371;
    const dLat = (deliveryLocation.lat - warungLocation.lat) * Math.PI / 180;
    const dLon = (deliveryLocation.lng - warungLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(warungLocation.lat * Math.PI / 180) * Math.cos(deliveryLocation.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getDeliveryFee = () => {
    if (deliveryMethod === 'pickup') return 0;
    const distance = calculateDistance();
    if (distance > 2) return 5000;
    if (distance > 0) return 2000;
    return 0;
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = getDeliveryFee();
  const total = subtotal + deliveryFee;

  const generateWhatsAppMessage = () => {
    let message = '*PESANAN WARUNG IBU NUN*\n\n';
    message += '*Detail Pesanan:*\n';
    message += '━━━━━━━━━━━━━━━\n';
    
    cart.forEach(item => {
      message += `\n📦 ${item.name}\n`;
      message += `   Jumlah: ${item.quantity}x\n`;
      message += `   Harga: Rp ${item.price.toLocaleString()}\n`;
      if (item.spiceLevel) message += `   🌶️ Level: ${item.spiceLevel}\n`;
      if (item.drink) message += `   🥤 Minuman: ${item.drink}\n`;
      if (item.bonus) message += `   🎁 Bonus: ${item.bonus}\n`;
      message += `   Subtotal: Rp ${(item.price * item.quantity).toLocaleString()}\n`;
    });
    
    message += '\n━━━━━━━━━━━━━━━\n';
    message += `*Subtotal:* Rp ${subtotal.toLocaleString()}\n`;
    
    if (deliveryMethod === 'delivery') {
      message += `*Ongkir:* Rp ${deliveryFee.toLocaleString()}\n`;
      message += `📍 Jarak: ~${calculateDistance().toFixed(2)} km\n`;
    } else {
      message += `*Metode:* 🚶 Pickup di Warung\n`;
    }
    
    message += `*TOTAL:* Rp ${total.toLocaleString()}\n`;
    message += '━━━━━━━━━━━━━━━\n';
    
    return encodeURIComponent(message);
  };

  const handleOrder = () => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }
    
    const needsSpiceLevel = cart.some(item => 
      item.category !== 'Minuman' && !item.spiceLevel
    );
    
    if (needsSpiceLevel) {
      alert('Mohon pilih level pedas untuk semua item!');
      return;
    }

    if (deliveryMethod === 'delivery' && (!deliveryLocation.lat || !deliveryLocation.lng)) {
      alert('Mohon masukkan lokasi pengantaran!');
      return;
    }

    // Trigger animation
    setIsOrdering(true);
    
    setTimeout(() => {
      const waNumber = '6287776621765';
      const message = generateWhatsAppMessage();
      window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
      setIsOrdering(false);
    }, 1500);
  };

  // Menu Page
  const MenuPage = () => (
    <div className="pb-24">
      {/* Info Bar */}
      <div className="bg-yellow-100 border-y-2 border-yellow-300 py-2 mb-6">
        <div className="max-w-6xl mx-auto px-4 flex justify-center items-center gap-6 text-sm">
          <span className="flex items-center gap-1">
            <Clock size={16} className="text-orange-600" />
            <span className="font-semibold">Buka: 09:00 - 21:00</span>
          </span>
          <span className="flex items-center gap-1">
            <Phone size={16} className="text-orange-600" />
            <span className="font-semibold">087776621765</span>
          </span>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {menuItems.map((category, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-orange-200">
              <div className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-6 py-4">
                <h2 className="text-xl font-bold">{category.category}</h2>
              </div>
              <div className="p-4 space-y-3">
                {category.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 hover:bg-orange-50 rounded-lg transition-all border border-gray-100">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-orange-600 font-bold">Rp {item.price.toLocaleString()}</p>
                      {item.bonus && (
                        <p className="text-xs text-green-600 font-semibold mt-1">🎁 Bonus: {item.bonus}</p>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart({ ...item, category: category.category })}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      + Pesan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-orange-500 shadow-2xl p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} Item
              </p>
              <p className="text-xl font-bold text-orange-600">
                Rp {subtotal.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('cart')}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <ShoppingCart size={24} />
              Lihat Keranjang
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Cart Page
  const CartPage = () => (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {cart.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart size={80} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Keranjang Kosong</h2>
          <p className="text-gray-600 mb-6">Yuk, pesan makanan favorit kamu!</p>
          <button
            onClick={() => setCurrentPage('menu')}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Lihat Menu
          </button>
        </div>
      ) : (
        <div>
          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div key={item.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-orange-300 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <p className="text-orange-600 font-semibold">Rp {item.price.toLocaleString()} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="bg-red-500 text-white w-8 h-8 rounded-full font-bold hover:bg-red-600 transition-all"
                    >
                      -
                    </button>
                    <span className="px-3 font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="bg-green-500 text-white w-8 h-8 rounded-full font-bold hover:bg-green-600 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Spice Level - Wajib untuk non-minuman */}
                {item.category !== 'Minuman' && (
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Flame className="text-red-500" size={16} />
                      Level Pedas (Wajib):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {spiceLevels.map(level => (
                        <button
                          key={level.id}
                          onClick={() => updateSpiceLevel(item.id, level.name)}
                          className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                            item.spiceLevel === level.name
                              ? 'bg-red-500 text-white shadow-lg'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {level.icon} {level.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bonus Drink - Optional */}
                {item.bonus && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                   
                    </label>
                    <select
                      value={item.drink || ''}
                      onChange={(e) => updateDrink(item.id, e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Tidak Ada</option>
                      <option value="Es Teajus">Es Teajus</option>
                      <option value="Teh Manis Panas">Teh Manis Panas</option>
                      <option value="Teh Tawar Panas">Teh Tawar Panas</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Delivery Method */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-orange-200">
            <h3 className="font-bold text-gray-800 mb-3 text-lg">Metode Pengambilan:</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => setDeliveryMethod('pickup')}
                className={`p-4 rounded-xl font-semibold transition-all ${
                  deliveryMethod === 'pickup'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🚶 Pickup di Warung
              </button>
              <button
                onClick={() => setDeliveryMethod('delivery')}
                className={`p-4 rounded-xl font-semibold transition-all ${
                  deliveryMethod === 'delivery'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🛵 Delivery
              </button>
            </div>

            {deliveryMethod === 'pickup' && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h4 className="font-bold text-blue-800 mb-2">📍 Lokasi Warung:</h4>
                <a
                  href={`https://www.google.com/maps?q=${warungLocation.lat},${warungLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline font-semibold block mb-3"
                >
                  Buka Google Maps →
                </a>
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 mt-3">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    <span className="font-semibold">Kami akan kabari via WhatsApp saat pesanan sudah siap diambil!</span>
                  </p>
                </div>
              </div>
            )}

            {deliveryMethod === 'delivery' && (
              <div className="space-y-3">
                <button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Navigation size={20} />
                  {isGettingLocation ? 'Mengambil Lokasi...' : 'Gunakan Lokasi Saat Ini'}
                </button>
                
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-500 text-sm">atau</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Latitude Lokasi Pengantaran:
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Contoh: -6.9175"
                    value={deliveryLocation.lat}
                    onChange={(e) => setDeliveryLocation({...deliveryLocation, lat: parseFloat(e.target.value)})}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Longitude Lokasi Pengantaran:
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Contoh: 107.6191"
                    value={deliveryLocation.lng}
                    onChange={(e) => setDeliveryLocation({...deliveryLocation, lng: parseFloat(e.target.value)})}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <p className="text-xs text-gray-600">
                  💡 Tip: Buka Google Maps, tekan & tahan lokasi pengantaran untuk mendapatkan koordinat
                </p>
                {deliveryLocation.lat && deliveryLocation.lng && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-green-800">
                      📍 Jarak: ~{calculateDistance().toFixed(2)} km
                    </p>
                    <p className="text-sm text-green-700">
                      Ongkir: Rp {deliveryFee.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-semibold">Rp {subtotal.toLocaleString()}</span>
              </div>
              {deliveryMethod === 'delivery' && (
                <div className="flex justify-between text-gray-700">
                  <span>Ongkir:</span>
                  <span className="font-semibold">Rp {deliveryFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-orange-600 pt-2 border-t-2">
                <span>TOTAL:</span>
                <span>Rp {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleOrder}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Phone size={24} />
              Pesan via WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {currentPage === 'cart' && (
                <button
                  onClick={() => setCurrentPage('menu')}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
                >
                  <ArrowLeft size={24} />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold">
                  {currentPage === 'menu' ? 'Menu' : 'Keranjang'}
                </h1>
                <p className="text-sm opacity-90 flex items-center gap-1">
                  <MapPin size={14} /> Warung Ibu Nun
                </p>
              </div>
            </div>
            {currentPage === 'menu' && (
              <button 
                onClick={() => setCurrentPage('cart')}
                className="relative bg-white text-orange-500 px-4 py-2 rounded-full font-semibold hover:bg-orange-50 transition-all transform hover:scale-105 shadow-md"
              >
                <ShoppingCart className="inline mr-2" size={20} />
                Keranjang
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Page Content */}
      {currentPage === 'menu' ? <MenuPage /> : <CartPage />}

      {/* Footer */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-6 mt-12">
        <p className="font-semibold">© 2024 Warung Ibu Nun - Masakan Rumahan Nikmat</p>
        <p className="text-sm opacity-90 mt-1">📞 087776621765</p>
      </div>
    </div>
  );
};

export default App;
