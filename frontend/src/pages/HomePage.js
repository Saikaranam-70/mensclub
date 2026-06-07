import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI } from '../services/api';
import { reviewsAPI } from '../services/api';
import { barbersAPI } from '../services/api';
import { galleryAPI } from '../services/api';
import { adminAPI } from '../services/api';
import { Scissors, Star, ArrowRight, Clock, Shield, Award, Users, ChevronDown, MapPin, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORY_ICONS = { haircut: '✂️', beard: '🪒', styling: '💇', coloring: '🎨', hair_treatment: '💆', combo: '⭐', other: '✨' };

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [featuredImages, setFeaturedImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [settings, setSettings] = useState(null);

  // Carousel & Extra Features States
  const [visibleCount, setVisibleCount] = useState(3);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isOpenStatus, setIsOpenStatus] = useState({ open: false, message: "Checking status..." });
  const [selectedServices, setSelectedServices] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [galleryLooks, setGalleryLooks] = useState([]);

  const slideshowImages = settings?.heroImages && settings.heroImages.length > 0
    ? settings.heroImages.map((url, i) => ({ _id: `hero-${i}`, imageUrl: url }))
    : featuredImages;

  useEffect(() => {
    setActiveImageIndex(0);
  }, [slideshowImages.length]);

  // Load Data
  useEffect(() => {
    servicesAPI.getAll({ active: true }).then(r => setServices(r.data.services || [])).catch(() => {});
    reviewsAPI.getAll({ limit: 10 }).then(r => setReviews(r.data.reviews || [])).catch(() => {});
    barbersAPI.getAll().then(r => setBarbers(r.data.barbers?.slice(0, 4) || [])).catch(() => {});
    galleryAPI.getAll().then(r => {
      setFeaturedImages(r.data.images?.filter(img => img.isFeatured) || []);
      setGalleryLooks(r.data.images || []);
    }).catch(() => {});
    adminAPI.getSettings().then(r => setSettings(r.data.settings)).catch(() => {});
  }, []);

  // Intersection Observer for scroll reveals
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    const elements = document.querySelectorAll('.reveal-section');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [services, reviews, barbers, galleryLooks]);

  // Slide Show Timer
  useEffect(() => {
    if (slideshowImages.length > 1) {
      const timer = setInterval(() => {
        setActiveImageIndex(prev => (prev + 1) % slideshowImages.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [slideshowImages]);

  // Carousel resize observer
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setVisibleCount(3);
      else if (window.innerWidth >= 768) setVisibleCount(2);
      else setVisibleCount(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Autoplay reviews slider
  useEffect(() => {
    if (reviews.length > 0) {
      const maxIndex = Math.max(0, reviews.length - visibleCount);
      const timer = setInterval(() => {
        setCurrentReviewIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [reviews, visibleCount]);

  // Open Status checker
  useEffect(() => {
    const checkIsOpen = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sun, 1 = Mon, etc.
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeVal = hours * 100 + minutes;

      // Mon - Fri
      if (day >= 1 && day <= 5) {
        return timeVal >= 900 && timeVal < 2000
          ? { open: true, message: "Open Now (Closes at 8:00 PM)" }
          : { open: false, message: "Closed Now (Opens at 9:00 AM)" };
      }
      // Saturday
      if (day === 6) {
        return timeVal >= 900 && timeVal < 1800
          ? { open: true, message: "Open Now (Closes at 6:00 PM)" }
          : { open: false, message: "Closed Now (Opens at 9:00 AM)" };
      }
      // Sunday
      if (day === 0) {
        return timeVal >= 1000 && timeVal < 1400
          ? { open: true, message: "Open Now (Closes at 2:00 PM)" }
          : { open: false, message: "Closed Now (Opens at 10:00 AM)" };
      }
      return { open: false, message: "Closed" };
    };

    setIsOpenStatus(checkIsOpen());
    const timer = setInterval(() => setIsOpenStatus(checkIsOpen()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Review Nav handlers
  const maxIndex = Math.max(0, reviews.length - visibleCount);
  const handlePrevReview = () => {
    setCurrentReviewIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };
  const handleNextReview = () => {
    setCurrentReviewIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Selector totals
  const toggleServiceSelection = (id) => {
    setSelectedServices(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const selectedItems = services.filter(s => selectedServices[s._id]);
  const totalEstimPrice = selectedItems.reduce((sum, s) => sum + s.price, 0);
  const totalEstimDuration = selectedItems.reduce((sum, s) => sum + s.duration, 0);

  const handleBookCalculator = () => {
    const selectedIds = Object.keys(selectedServices).filter(id => selectedServices[id]);
    localStorage.setItem('preselected_services', JSON.stringify(selectedIds));
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/book';
    } else {
      window.location.href = '/register';
    }
  };

  const filteredLooks = activeTab === 'all'
    ? galleryLooks
    : galleryLooks.filter(look => look.category === activeTab);

  return (
    <div>
      {/* HERO SECTION */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', background: '#050505' }}>
        {/* Background Video Overlay */}
        <video 
          className="hero-video-bg" 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-barber-cutting-hair-close-up-shot-44023-large.mp4" type="video/mp4" />
        </video>

        {/* Ambient Glow Blobs */}
        <div className="glow-blob" style={{ top: '10%', right: '5%', width: 450, height: 450, background: 'var(--gold)' }} />
        <div className="glow-blob" style={{ bottom: '15%', left: '10%', width: 350, height: 350, background: 'rgba(212, 175, 55, 0.4)' }} />
        {/* BG Grid Pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.02, backgroundImage: 'repeating-linear-gradient(45deg, var(--gold) 0, var(--gold) 1px, transparent 0, transparent 50%)', backgroundSize: '30px 30px', pointerEvents: 'none' }}/>

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: 'clamp(40px, 8vw, 80px)', paddingBottom: 'clamp(40px, 8vw, 80px)' }}>
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-reveal-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', borderRadius: 20, padding: '6px 14px', marginBottom: 24, fontSize: 13, color: 'var(--gold)', fontWeight: 500 }}>
                <Scissors size={13}/> {settings?.tagline || 'Premium Grooming Studio'}
              </div>
              <h1 className="hero-reveal-2" style={{ fontSize: 'clamp(42px, 7vw, 72px)', fontFamily: 'Playfair Display', fontWeight: 800, lineHeight: 1.08, marginBottom: 24, letterSpacing: '-0.02em', color: '#f5f0e8' }}>
                Define Your<br/>
                <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Signature</em><br/>
                Style
              </h1>
              <p className="hero-reveal-3" style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
                Experience grooming at its finest. From premium cuts to precision beard styling, our master barbers deliver looks tailored to your character.
              </p>
              <div className="hero-reveal-4 hero-buttons">
                <Link to="/register" className="btn btn-gold btn-lg">
                  Book Session <ArrowRight size={18}/>
                </Link>
                <a href="#calculator" className="btn btn-outline btn-lg">Custom Est.</a>
              </div>
              <div className="hero-reveal-4 hero-stats">
                {[['1,200+', 'Happy Clients'], ['4', 'Master Stylists'], ['4.9', 'Avg Rating']].map(([num, label]) => (
                  <div key={label}>
                    <div style={{ fontSize: 28, fontFamily: 'Playfair Display', fontWeight: 700, color: 'var(--gold)' }}>{num}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual Slideshow */}
            <div className="hero-reveal-visual hero-visual-wrapper">
              <div className="hero-visual" style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
                {slideshowImages.length > 0 ? (
                  slideshowImages.map((img, index) => (
                    <img 
                      key={img._id}
                      src={img.imageUrl} 
                      alt={img.title || "Featured Style"} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        position: 'absolute', 
                        inset: 0,
                        opacity: index === activeImageIndex ? 1 : 0,
                        transition: 'opacity 0.8s ease-in-out',
                      }}
                    />
                  ))
                ) : (
                  <img 
                    src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800" 
                    alt="Premium Men's Club Interior" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                  />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,5,5,0.75) 0%, transparent 60%, rgba(5,5,5,0.4) 100%)' }} />
                
                {/* Floating Glassmorphic Badges */}
                <div className="hero-badge-left" style={{ background: 'rgba(26,26,26,0.8)', backdropFilter: 'blur(12px)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Next available slot</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--gold)' }}>Today, 2:30 PM</div>
                </div>
                <div className="hero-badge-right" style={{ background: 'rgba(26,26,26,0.8)', backdropFilter: 'blur(12px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Star size={14} fill="var(--gold)" color="var(--gold)"/>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>4.9</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--text-muted)', animation: 'fadeIn 1s 1s forwards', opacity: 0 }}>
          <span style={{ fontSize: 11, letterSpacing: 1 }}>SCROLL DOWN</span>
          <ChevronDown size={14} style={{ animation: 'bounceButton 2s infinite' }}/>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="section reveal-section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="divider divider-center"/>
            <h2 className="section-title">Elevating <span style={{ color: 'var(--gold)' }}>Barbering</span></h2>
            <p className="section-subtitle" style={{ margin: '16px auto 0' }}>Why Men's Club stands as the elite destination for gentlemen's grooming.</p>
          </div>
          <div className="grid-4">
            {[
              { icon: <Award size={28}/>, title: 'Master Barbering', desc: 'Expert techniques. Specialised scissor cuts, razor fades, and meticulous finishes.' },
              { icon: <Clock size={28}/>, title: 'Real-time Booking', desc: 'Secure your favorite barber instantly. No waiting lines, no hassle.' },
              { icon: <Shield size={28}/>, title: 'Luxury Grooming Products', desc: 'We select and use only premium tonics, clays, oils, and balms for maximum health.' },
              { icon: <Users size={28}/>, title: 'First-Class Comfort', desc: 'Relaxing environment, complimentary refreshments, hot towel treatments.' },
            ].map((item, i) => (
              <div key={i} className="card card-gold" style={{ padding: 28, textAlign: 'center', background: 'var(--surface)' }}>
                <div style={{ width: 60, height: 60, background: 'var(--gold-dim)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--gold)' }}>{item.icon}</div>
                <h3 style={{ fontSize: 18, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      {services.length > 0 && (
        <section className="section reveal-section" style={{ background: 'var(--bg-primary)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div className="divider"/>
                <h2 className="section-title">Our <span style={{ color: 'var(--gold)' }}>Services</span></h2>
                <p className="section-subtitle" style={{ marginTop: 8 }}>From sharp tapers to luxury combos. View our specialized service menu.</p>
              </div>
              <Link to="/services" className="btn btn-outline" style={{ flexShrink: 0 }}>View All <ArrowRight size={16}/></Link>
            </div>
            <div className="grid-3">
              {services.slice(0, 6).map(service => (
                <div key={service._id} className="card card-gold" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)' }}>
                  <div style={{ height: 180, overflow: 'hidden', relative: 'true' }}>
                    <img 
                      src={service.image || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800"} 
                      alt={service.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{service.name}</h3>
                        {service.isPopular && <span className="badge badge-gold">Popular</span>}
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>{service.description}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--gold)' }}>₹{service.price}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱ {service.duration} min</div>
                      </div>
                      <Link to="/book" className="btn btn-gold btn-sm">Book Slot</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW FEATURE: INTERACTIVE PRICE & ESTIMATOR CALCULATOR */}
      <section id="calculator" className="section reveal-section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="divider divider-center"/>
            <h2 className="section-title">Grooming <span style={{ color: 'var(--gold)' }}>Estimator</span></h2>
            <p className="section-subtitle" style={{ margin: '16px auto 0' }}>Select multiple services to estimate your customized session pricing and duration.</p>
          </div>

          <div className="estimator-box">
            <div className="estimator-grid">
              {/* Left Selector Column */}
              <div>
                <h4 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>Select Services:</h4>
                <div className="services-selector-grid">
                  {services.map(s => {
                    const isSelected = !!selectedServices[s._id];
                    return (
                      <div 
                        key={s._id} 
                        className={`estimator-service-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleServiceSelection(s._id)}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: 16, fontWeight: 600, color: isSelected ? 'var(--gold)' : 'inherit' }}>{s.name}</span>
                            <span style={{ fontSize: 18 }}>{CATEGORY_ICONS[s.category] || '💈'}</span>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>⏱ {s.duration} mins</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>₹{s.price}</span>
                          <span style={{
                            width: 18, height: 18, borderRadius: 4, border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isSelected ? 'var(--gold)' : 'transparent',
                            borderColor: isSelected ? 'var(--gold)' : 'var(--border)',
                            color: '#000', fontSize: 12, fontWeight: 700
                          }}>
                            {isSelected ? '✓' : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Summary Panel */}
              <div className="estimator-summary-panel">
                <div>
                  <h4 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>Session Summary</h4>
                  {selectedItems.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>
                      No services selected. Click cards on the left to add.
                    </div>
                  ) : (
                    <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 20 }}>
                      {selectedItems.map(item => (
                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                          <span style={{ color: 'var(--text-primary)' }}>• {item.name}</span>
                          <span>₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 'auto' }}>
                  <div className="summary-item-row">
                    <span>Total Services:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedItems.length}</span>
                  </div>
                  <div className="summary-item-row">
                    <span>Estimated Time:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{totalEstimDuration} min</span>
                  </div>
                  <div className="summary-item-row" style={{ borderTop: '1px dotted var(--border)', paddingTop: 10, marginTop: 10, marginBottom: 20 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Total Cost:</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold)' }}>₹{totalEstimPrice}</span>
                  </div>
                  
                  <button 
                    disabled={selectedItems.length === 0}
                    onClick={handleBookCalculator}
                    className="btn btn-gold" 
                    style={{ width: '100%', padding: '14px' }}
                  >
                    Book Selected Session <ArrowRight size={16}/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      {barbers.length > 0 && (
        <section className="section reveal-section" style={{ background: 'var(--bg-primary)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div className="divider divider-center"/>
              <h2 className="section-title">Master <span style={{ color: 'var(--gold)' }}>Stylists</span></h2>
              <p className="section-subtitle" style={{ margin: '16px auto 0' }}>Meticulous professionals who turn haircutting into an art form.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
              {barbers.map(barber => (
                <div key={barber._id} className="card card-gold" style={{ textAlign: 'center', padding: 28, background: 'var(--surface)' }}>
                  <div style={{ width: 100, height: 100, borderRadius: '50%', border: '2px solid var(--border)', overflow: 'hidden', margin: '0 auto 16px', transition: 'border-color 0.3s' }} className="barber-img-wrapper">
                    {barber.profileImage ? (
                      <img src={barber.profileImage} alt={barber.user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: '#0a0a0a' }}>
                        {barber.user?.name?.[0]}
                      </div>
                    )}
                  </div>
                  <h3 style={{ fontSize: 18, marginBottom: 4, fontWeight: 600 }}>{barber.user?.name}</h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>{barber.experience} Years Experience</div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                    {(barber.specializations || []).slice(0, 3).map(s => (
                      <span key={s} className="badge badge-gray" style={{ fontSize: 10, background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>{s}</span>
                    ))}
                  </div>
                  {barber.rating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--gold)', fontSize: 14 }}>
                      <Star size={14} fill="var(--gold)" color="var(--gold)"/>
                      <span style={{ fontWeight: 600 }}>{barber.rating.toFixed(1)}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({barber.totalReviews} Reviews)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW LOOKBOOK SECTION WITH FILTER TABS */}
      {galleryLooks.length > 0 && (
        <section className="section reveal-section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div className="divider"/>
                <h2 className="section-title">Style <span style={{ color: 'var(--gold)' }}>Lookbook</span></h2>
                <p className="section-subtitle" style={{ marginTop: 8 }}>Filter and explore custom cuts, shapes, and colors from our active looks.</p>
              </div>
              <Link to="/gallery" className="btn btn-outline" style={{ flexShrink: 0 }}>Full Gallery <ArrowRight size={16}/></Link>
            </div>

            {/* Filter Navigation */}
            <div className="lookbook-tabs-nav">
              {['all', 'haircut', 'beard', 'styling', 'coloring', 'salon'].map(tab => (
                <button 
                  key={tab} 
                  className={`lookbook-tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Lookbook Grid */}
            <div className="lookbook-grid">
              {filteredLooks.slice(0, 8).map(look => (
                <div key={look._id} className="lookbook-card">
                  <div className="lookbook-image-wrapper">
                    <img src={look.imageUrl} alt={look.title || look.category} />
                  </div>
                  <div className="lookbook-overlay">
                    <span className="lookbook-category">{look.category}</span>
                    <h4 className="lookbook-title">{look.title || `${look.category.toUpperCase()} look`}</h4>
                  </div>
                </div>
              ))}
              {filteredLooks.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No active looks found in this category.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* REVIEWS SECTION WITH INTERACTIVE SLIDER */}
      {reviews.length > 0 && (
        <section className="section reveal-section" style={{ background: 'var(--bg-primary)', overflow: 'hidden' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div className="divider"/>
                <h2 className="section-title">Client <span style={{ color: 'var(--gold)' }}>Opinions</span></h2>
                <p className="section-subtitle" style={{ marginTop: 8 }}>Read real reviews left by our loyal patrons.</p>
              </div>
              
              {/* Navigation arrows */}
              <div className="slider-controls" style={{ margin: 0 }}>
                <button onClick={handlePrevReview} className="slider-arrow" aria-label="Previous review">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={handleNextReview} className="slider-arrow" aria-label="Next review">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="reviews-slider-container">
              <div 
                className="reviews-track" 
                style={{ transform: `translateX(-${currentReviewIndex * (100 / visibleCount)}%)` }}
              >
                {reviews.map(r => (
                  <div key={r._id} className="review-slide">
                    <div className="review-carousel-card">
                      <div>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={14} fill={i < r.rating ? 'var(--gold)' : 'transparent'} color="var(--gold)"/>
                          ))}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic', fontFamily: 'Cormorant Garamond' }}>
                          "{r.review || 'Exceptional grooming session! Highly professional.'}"
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#050505', fontSize: 15 }}>
                          {r.user?.name?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{r.user?.name || 'Verified Client'}</div>
                          <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 500 }}>{r.service?.name || 'Grooming'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Dots */}
            <div className="slider-controls" style={{ marginTop: 0 }}>
              <div className="slider-dots">
                {Array.from({ length: Math.max(0, reviews.length - visibleCount + 1) }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`slider-dot ${currentReviewIndex === idx ? 'active' : ''}`}
                    onClick={() => setCurrentReviewIndex(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* LOCATION & MAPS SECTION */}
      <section className="section reveal-section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 48, alignItems: 'center' }}>
            {/* Contact Details Card */}
            <div>
              <div className="divider" />
              <h2 className="section-title">Visit Our <span style={{ color: 'var(--gold)' }}>Studio</span></h2>
              <p className="section-subtitle" style={{ marginBottom: 32 }}>We are located in Pothinamallayya Palem, Visakhapatnam. Walk in or book online to secure your session.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--gold)' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 }}>ADDRESS</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                      {settings?.address || 'Anand Nagar, Pothinamallayya Palem, Potinamallayyapalem, Andhra Pradesh 530041'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--gold)' }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 }}>PHONE CONTACT</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>
                      {settings?.phone || '091105 78818'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--gold)' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 }}>EMAIL</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                      {settings?.email || 'hello@mensclubbarbershop.com'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--gold)' }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 }}>OPERATING HOURS</h4>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginTop: 4 }}>
                      <div>Mon – Fri: {settings?.openingHours?.monday?.open || '09:00'} – {settings?.openingHours?.monday?.close || '20:00'}</div>
                      <div>Saturday: {settings?.openingHours?.saturday?.open || '09:00'} – {settings?.openingHours?.saturday?.close || '18:00'}</div>
                      <div>Sunday: {settings?.openingHours?.sunday?.closed ? 'Closed' : `${settings?.openingHours?.sunday?.open || '10:00'} – ${settings?.openingHours?.sunday?.close || '14:00'}`}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Google Map Iframe Container */}
            <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 400, borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
              <iframe
                title="Men's Club Barber Shop Map Location"
                src={settings?.mapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3798.7348085682374!2d83.34671547370043!3d17.80415629066815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a395b9a868af8fd%3A0x956d9b81eb3ef39b!2sMEN&#39;S%20CLUB%20BARBER%20SHOP!5e0!3m2!1sen!2sin!4v1780814146539!5m2!1sen!2sin"}
                width="100%"
                height="100%"
                style={{ border: 0, position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="section reveal-section" style={{ background: 'var(--bg-primary)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ maxWidth: 650, margin: '0 auto' }}>
            <div className="divider divider-center"/>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontFamily: 'Playfair Display', fontWeight: 800, marginBottom: 20, color: '#f5f0e8' }}>
              Ready for a <span style={{ color: 'var(--gold)' }}>Premium Cut</span>?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 36, lineHeight: 1.7 }}>
              Book your slot at Men's Club Barber Shop now and experience the absolute zenith of precision grooming.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-gold btn-lg">Book Slot Now <ArrowRight size={18}/></Link>
              <Link to="/services" className="btn btn-outline btn-lg">View Services</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href={`https://wa.me/919110578818?text=${encodeURIComponent("Hello! I'd like to book an appointment or ask about the services at Men's Club Barber Shop.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        title="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.25 8.477 3.522 2.264 2.271 3.51 5.284 3.51 8.487 0 6.608-5.337 11.945-11.95 11.945-2.012-.001-3.992-.507-5.747-1.472L0 24zm6.657-3.818l.389.231c1.516.902 3.264 1.378 5.048 1.379h.007c5.82 0 10.553-4.731 10.556-10.553.002-2.823-1.097-5.477-3.097-7.48C17.561 1.761 14.908 1.06 12.087 1.06 6.264 1.06 1.532 5.792 1.529 11.615c-.001 1.895.493 3.748 1.431 5.371l.244.423-.95 3.47 3.553-.932zM17.065 14.195c-.277-.139-1.643-.811-1.897-.903-.254-.093-.44-.139-.624.139-.185.277-.714.903-.876 1.088-.162.185-.324.208-.601.069-.277-.139-1.17-.431-2.228-1.376-.823-.734-1.379-1.641-1.54-1.918-.162-.277-.017-.427.121-.565.125-.124.277-.324.416-.486.139-.162.185-.277.277-.462.093-.185.046-.347-.023-.486-.069-.139-.624-1.503-.855-2.058-.225-.541-.454-.467-.624-.467-.162 0-.347-.015-.532-.015s-.486.069-.739.347c-.254.277-.971.949-.971 2.313 0 1.365.994 2.684 1.133 2.869.139.185 1.956 2.986 4.739 4.186.662.286 1.179.457 1.58.584.665.211 1.27.181 1.748.11.532-.077 1.643-.671 1.874-1.319.231-.648.231-1.203.162-1.319-.069-.115-.254-.185-.531-.324z" />
        </svg>
      </a>
    </div>
  );
}
