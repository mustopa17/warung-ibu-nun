import React, { useState } from 'react';
import { MapPin, ShoppingCart, Phone, Clock, Flame, ArrowLeft, Navigation, Wallet, X } from 'lucide-react';

const WarungIbuNun = () => {
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState('menu');
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [deliveryLocation, setDeliveryLocation] = useState({ lat: '', lng: '' });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  
  const warungLocation = { lat: -6.178059, lng: 106.158745 };
  
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
      setCart([...cart, { ...item, quantity: 1, spiceLevel: null, drink: null, category: item.category }]);
    }
  };

  const updateQuantity = (id, change) => {
    setCart(prev =>
      prev
        .map(item => item.id === id ? { ...item, quantity: item.quantity + change } : item)
        .filter(item => item.quantity > 0)
    );
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

  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

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
    const R = 6371; // km
    const toRad = v => v * Math.PI / 180;
    const dLat = toRad(deliveryLocation.lat - warungLocation.lat);
    const dLon = toRad(deliveryLocation.lng - warungLocation.lng);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(warungLocation.lat)) * Math.cos(toRad(deliveryLocation.lat)) *
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
    message += '━━━━━━━━━━━━━━━\n\n';
    
    if (paymentMethod === 'dana') {
      message += '*Metode Pembayaran:* DANA\n';
      message += '*Nomor DANA:* 087840009764\n';
      message += '*a.n:* Warung Ibu Nun\n\n';
      message += '💡 Mohon transfer dan kirim bukti pembayaran';
    } else if (paymentMethod === 'qris') {
      message += '*Metode Pembayaran:* QRIS\n';
      message += '*NMID:* ID1024316244465\n\n';
      message += '💡 Mohon scan QRIS dan kirim bukti pembayaran';
    } else {
      message += '*Metode Pembayaran:* Cash (Bayar di Tempat)';
    }
    
    return encodeURIComponent(message);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }
    
    const needsSpiceLevel = cart.some(item => 
      item.category === 'Aneka Nasi Goreng' && !item.spiceLevel
    );
    
    if (needsSpiceLevel) {
      alert('Mohon pilih level pedas untuk semua Nasi Goreng!');
      return;
    }

    if (deliveryMethod === 'delivery' && (!deliveryLocation.lat || !deliveryLocation.lng)) {
      alert('Mohon masukkan lokasi pengantaran!');
      return;
    }

    setShowPaymentModal(true);
  };

  const handleOrder = () => {
    if (!paymentMethod) {
      alert('Mohon pilih metode pembayaran!');
      return;
    }

    setIsOrdering(true);
    setShowPaymentModal(false);
    
    // Simulasi proses pemesanan lalu buka WA
    setTimeout(() => {
      const waNumber = '6287776621765';
      const message = generateWhatsAppMessage();
      window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
      setIsOrdering(false);
      setPaymentMethod('');
      // optionally clear cart after ordering:
      // clearCart();
    }, 1200);
  };

  const PaymentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex justify-between items-center rounded-t-2xl">
          <h3 className="text-xl font-bold">Pilih Metode Pembayaran</h3>
          <button
            onClick={() => {
              setShowPaymentModal(false);
              setPaymentMethod('');
            }}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* DANA */}
          <button
            onClick={() => setPaymentMethod('dana')}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              paymentMethod === 'dana'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                D
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">DANA</h4>
                <p className="text-sm text-gray-600">087840009764</p>
                <p className="text-xs text-gray-500">a.n. Warung Ibu Nun</p>
              </div>
              {paymentMethod === 'dana' && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </div>
          </button>

          {/* QRIS */}
          <button
            onClick={() => setPaymentMethod('qris')}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              paymentMethod === 'qris'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-red-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                QR
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">QRIS</h4>
                <p className="text-sm text-gray-600">Scan & Pay</p>
                <p className="text-xs text-gray-500">NMID: ID1024316244465</p>
              </div>
              {paymentMethod === 'qris' && (
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </div>
          </button>

          {/* Cash */}
          <button
            onClick={() => setPaymentMethod('cash')}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              paymentMethod === 'cash'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Wallet className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">Cash</h4>
                <p className="text-sm text-gray-600">Bayar di Tempat</p>
              </div>
              {paymentMethod === 'cash' && (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </div>
          </button>

          <div className="pt-4 border-t-2">
            <div className="flex justify-between mb-4">
              <span className="text-lg font-bold">Total Pembayaran:</span>
              <span className="text-xl font-bold text-orange-600">Rp {total.toLocaleString()}</span>
            </div>
            
            <button
              onClick={handleOrder}
              disabled={!paymentMethod}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isOrdering ? 'Memproses...' : 'Konfirmasi Pesanan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const TopBar = ({ title = 'Warung Ibu Nun', showBack = false }) => (
    <div className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        {showBack ? (
          <button onClick={() => setCurrentPage('menu')} className="p-2 rounded-lg bg-gray-100">
            <ArrowLeft size={18} />
          </button>
        ) : (
          <div className="w-8" />
        )}
        <h1 className="text-lg font-bold text-gray-800">{title}</h1>
        <div className="flex-1" />
        <button onClick={() => setCurrentPage('cart')} className="flex items-center gap-2 bg-orange-100 px-3 py-2 rounded-lg">
          <ShoppingCart size={18} />
          <span className="text-sm font-semibold">Keranjang ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
        </button>
      </div>
    </div>
  );

  const MenuPage = () => (
    <div className="pb-24">
      <div className="bg-yellow-100 border-y-2 border-yellow-300 py-2 mb-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 text-sm">
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

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {menuItems.map((category, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-orange-200">
              <div className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-4 py-3">
                <h2 className="text-lg md:text-xl font-bold">{category.category}</h2>
              </div>
              <div className="p-3 md:p-4 space-y-3">
                {category.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 hover:bg-orange-50 rounded-lg transition-all border border-gray-100">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm md:text-base">{item.name}</h3>
                      <p className="text-orange-600 font-bold text-sm md:text-base">Rp {item.price.toLocaleString()}</p>
                      {item.bonus && (
                        <p className="text-xs text-green-600 font-semibold mt-1">🎁 Bonus: {item.bonus}</p>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart({ ...item, category: category.category })}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 md:px-4 py-2 rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105 text-sm md:text-base whitespace-nowrap"
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

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-orange-500 shadow-2xl p-3 md:p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center gap-3">
            <div>
              <p className="text-xs md:text-sm text-gray-600">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} Item
              </p>
              <p className="text-lg md:text-xl font-bold text-orange-600">
                Rp {subtotal.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('cart')}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm md:text-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
            >
              <ShoppingCart size={20} className="md:w-6 md:h-6" />
              <span className="hidden sm:inline">Lihat Keranjang</span>
              <span className="sm:hidden">Keranjang</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

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
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div key={item.id} className="bg-white border-2 border-gray-200 rounded-xl p-3 md:p-4 hover:border-orange-300 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm md:text-base truncate">{item.name}</h3>
                    <p className="text-orange-600 font-semibold text-sm md:text-base">Rp {item.price.toLocaleString()} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 bg-gray-100 rounded-full px-1 flex-shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="bg-red-500 text-white w-7 h-7 md:w-8 md:h-8 rounded-full font-bold hover:bg-red-600 transition-all text-sm md:text-base"
                    >
                      -
                    </button>
                    <span className="px-2 md:px-3 font-bold text-sm md:text-base">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="bg-green-500 text-white w-7 h-7 md:w-8 md:h-8 rounded-full font-bold hover:bg-green-600 transition-all text-sm md:text-base"
                    >
                      +
                    </button>
                  </div>
                </div>

                {item.category === 'Aneka Nasi Goreng' && (
                  <div className="mb-3">
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Flame className="text-red-500" size={16} />
                      Level Pedas (Wajib):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {spiceLevels.map(level => (
                        <button
                          key={level.id}
                          onClick={() => updateSpiceLevel(item.id, level.name)}
                          className={`px-2 md:px-3 py-2 rounded-lg font-semibold text-xs md:text-sm transition-all ${
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

                {item.bonus && (
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                      🥤 Pilih Minuman Bonus (Opsional):
                    </label>
                    <select
                      value={item.drink || ''}
                      onChange={(e) => updateDrink(item.id, e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 text-sm md:text-base"
                    >
                      <option value="">Tidak Ada</option>
                      <option value="Es Teajus">Es Teajus</option>
                      <option value="Teh Manis Panas">Teh Manis Panas</option>
                      <option value="Teh Tawar Panas">Teh Tawar Panas</option>
                    </select>
                  </div>
                )}

                <div className="mt-3 flex justify-between items-center gap-3">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-sm text-red-600 font-semibold hover:underline"
                  >
                    Hapus
                  </button>
                  <div className="text-sm text-gray-600">Subtotal: Rp {(item.price * item.quantity).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 border-2 border-orange-200">
            <h3 className="font-bold text-gray-800 mb-3 text-base md:text-lg">Metode Pengambilan:</h3>
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
              <button
                onClick={() => setDeliveryMethod('pickup')}
                className={`p-3 md:p-4 rounded-xl font-semibold transition-all text-sm md:text-base ${
                  deliveryMethod === 'pickup'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🚶 Pickup
              </button>
              <button
                onClick={() => setDeliveryMethod('delivery')}
                className={`p-3 md:p-4 rounded-xl font-semibold transition-all text-sm md:text-base ${
                  deliveryMethod === 'delivery'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🛵 Delivery
              </button>
            </div>

            {deliveryMethod === 'pickup' && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 md:p-4">
                <h4 className="font-bold text-blue-800 mb-2 text-sm md:text-base">📍 Lokasi Warung:</h4>
                <a
                  href={`https://www.google.com/maps?q=${warungLocation.lat},${warungLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline font-semibold block mb-3 text-sm md:text-base"
                >
                  Buka Google Maps →
                </a>
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
                  <p className="text-xs md:text-sm text-green-800 flex items-start gap-2">
                    <span className="text-base md:text-lg flex-shrink-0">✅</span>
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
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base"
                >
                  <Navigation size={18} className="md:w-5 md:h-5" />
                  {isGettingLocation ? 'Mengambil Lokasi...' : 'Gunakan Lokasi Saat Ini'}
                </button>
                
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-500 text-xs md:text-sm">atau</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Latitude Lokasi:
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Contoh: -6.178059"
                    value={deliveryLocation.lat}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDeliveryLocation({...deliveryLocation, lat: v === '' ? '' : parseFloat(v)});
                    }}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 md:px-4 py-2 focus:outline-none focus:border-orange-500 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Longitude Lokasi:
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Contoh: 106.158745"
                    value={deliveryLocation.lng}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDeliveryLocation({...deliveryLocation, lng: v === '' ? '' : parseFloat(v)});
                    }}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 md:px-4 py-2 focus:outline-none focus:border-orange-500 text-sm md:text-base"
                  />
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-xl p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600">Estimasi Jarak</p>
                      <p className="font-bold text-gray-800">{calculateDistance().toFixed(2)} km</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Estimasi Ongkir</p>
                      <p className="font-bold text-orange-600">Rp {getDeliveryFee().toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-2 border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-xs text-gray-600">Subtotal</p>
                <p className="font-bold text-gray-800">Rp {subtotal.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Ongkir</p>
                <p className="font-bold text-orange-600">Rp {deliveryFee.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div>
                <p className="text-sm font-bold text-gray-800">Total</p>
                <p className="text-xl font-extrabold text-orange-600">Rp {total.toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleCheckout}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl"
                >
                  Checkout
                </button>
                <button
                  onClick={() => { if(window.confirm('Kosongkan keranjang?')) clearCart(); }}
                  className="text-sm text-gray-500 underline"
                >
                  Kosongkan Keranjang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Warung Ibu Nun" showBack={currentPage !== 'menu'} />

      <main className="pt-4 pb-24">
        {currentPage === 'menu' && <MenuPage />}
        {currentPage === 'cart' && <CartPage />}
      </main>

      {showPaymentModal && <PaymentModal />}

      {/* Simple footer / status */}
      <footer className="fixed bottom-0 left-0 right-0 md:static md:mt-8">
        {isOrdering && (
          <div className="w-full bg-green-600 text-white text-center py-2">
            Memproses pesanan...
          </div>
        )}
      </footer>
    </div>
  );
};

export default WarungIbuNun;
