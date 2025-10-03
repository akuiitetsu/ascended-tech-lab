# Responsive Design Quick Reference Guide

## 🎯 Quick Testing Commands

### Browser DevTools Responsive Mode
1. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. Press `Ctrl+Shift+M` (Windows) / `Cmd+Shift+M` (Mac) for device toolbar
3. Test these presets:
   - iPhone SE (375×667)
   - iPhone 12 Pro (390×844)
   - iPad (768×1024)
   - iPad Pro (1024×1366)
   - Surface Pro 7 (912×1368)

### Custom Sizes to Test
```
Mobile Small:    320×568
Mobile Large:    428×926
Tablet Portrait: 768×1024
Tablet Landscape: 1024×768
Laptop 13":      1280×800
Desktop FHD:     1920×1080
Desktop 4K:      3840×2160
Ultra-wide 21:9: 3440×1440
Refrigerator:    600×1800
```

---

## 📱 Device Breakpoint Cheatsheet

```css
/* Small Mobile */
@media (max-width: 480px) { }

/* Large Mobile */
@media (min-width: 481px) and (max-width: 768px) { }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { }

/* Laptop */
@media (min-width: 1025px) and (max-width: 1440px) { }

/* Desktop */
@media (min-width: 1441px) and (max-width: 1920px) { }

/* Large Display */
@media (min-width: 1921px) { }

/* 4K/5K */
@media (min-width: 2560px) { }

/* Ultra-wide */
@media (min-aspect-ratio: 21/9) { }

/* Portrait Kiosk */
@media (max-width: 800px) and (min-height: 1024px) { }

/* Landscape Mobile */
@media (max-height: 600px) and (orientation: landscape) { }

/* Touch Devices */
@media (hover: none) and (pointer: coarse) { }
```

---

## 🎮 Room Files

| Room | File | Status |
|------|------|--------|
| AITRIX | `src/rooms/aitrix-room.html` | ✅ |
| CODEVANCE | `src/rooms/codevance-room.html` | ✅ |
| FLOWBYTE | `src/rooms/flowchart-room.html` | ✅ |
| NETXUS | `src/rooms/netxus-room.html` | ✅ |
| SCHEMAX | `src/rooms/schemax-room.html` | ✅ |

**Framework:** `static/css/responsive-rooms.css`

---

## ✅ Quick Checklist (Per Room)

### Visual Check
- [ ] No horizontal scrollbar
- [ ] All text readable
- [ ] No overlapping elements
- [ ] Buttons clearly visible
- [ ] Icons display correctly

### Interaction Check
- [ ] All buttons clickable/tappable
- [ ] Touch targets ≥ 44px
- [ ] Hover effects (desktop only)
- [ ] Active states work
- [ ] Scrolling smooth

### Layout Check
- [ ] Sidebar behaves correctly
- [ ] Main content area visible
- [ ] Modal/difficulty screen centered
- [ ] Level grid adapts properly
- [ ] Game controls accessible

### Orientation Check
- [ ] Portrait → Landscape works
- [ ] Landscape → Portrait works
- [ ] No content loss
- [ ] Layout reflows correctly

---

## 🔧 Common Fixes

### Fix: Horizontal Scrolling
```css
* {
    box-sizing: border-box;
}
.container {
    max-width: 100%;
    overflow-x: hidden;
}
```

### Fix: Touch Targets Too Small
```css
button, .btn {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
}
```

### Fix: Mobile Viewport Height
```javascript
function setViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setViewportHeight();
window.addEventListener('resize', setViewportHeight);
```

### Fix: Text Too Small on Large Displays
```css
@media (min-width: 1921px) {
    body { font-size: 18px; }
}
@media (min-width: 2560px) {
    body { font-size: 20px; }
}
```

---

## 📊 Touch Target Sizes

| Device Type | Minimum | Comfortable |
|------------|---------|-------------|
| Mobile | 44px | 48px |
| Tablet | 44px | 52px |
| Kiosk/Refrigerator | 55px | 65px |
| TV/Large Display | 60px | 70px |

---

## 🎨 Font Size Guidelines

| Screen Size | Base Size |
|------------|-----------|
| 320px - 480px | 14px |
| 481px - 768px | 15px |
| 769px - 1024px | 16px |
| 1025px - 1440px | 16px |
| 1441px - 1920px | 16-18px |
| 1921px+ | 18-20px |
| 2560px+ | 20-22px |

---

## 🚀 Testing Priority

### Priority 1 (Must Test)
1. iPhone (375×667, 390×844)
2. iPad (768×1024)
3. Desktop 1080p (1920×1080)

### Priority 2 (Should Test)
4. Samsung Galaxy (360×740)
5. iPad Pro (1024×1366)
6. Desktop 1440p (2560×1440)

### Priority 3 (Nice to Test)
7. Ultra-wide (3440×1440)
8. 4K (3840×2160)
9. Custom portrait (600×1800)

---

## 🐛 Debugging Tips

### Check Element Sizing
```javascript
// In browser console
const element = document.querySelector('.your-element');
console.log(element.getBoundingClientRect());
```

### View Current Viewport
```javascript
console.log(`${window.innerWidth} × ${window.innerHeight}`);
```

### Check Media Query Match
```javascript
console.log(window.matchMedia('(max-width: 768px)').matches);
```

### Visualize Touch Targets
```css
/* Temporarily add to CSS */
button, .btn {
    outline: 2px solid red !important;
}
```

---

## 📝 Code Snippets

### Responsive Container
```html
<div class="container">
    <!-- Content here -->
</div>
```

### Responsive Grid
```html
<div class="grid grid-auto-fit">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>
```

### Touch-Optimized Button
```html
<button class="btn touch-target">
    Click Me
</button>
```

### Flexible Layout
```html
<div class="flex flex-wrap items-center justify-between gap-md">
    <div>Left</div>
    <div>Right</div>
</div>
```

---

## 🔗 Important Links

**Documentation:**
- `RESPONSIVE_DESIGN_SUMMARY.md` - Full implementation details
- `RESPONSIVE_DESIGN_TESTING.md` - Complete testing guide
- `static/css/responsive-rooms.css` - Responsive framework

**Resources:**
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Can I Use](https://caniuse.com/) - Browser support

---

## 💡 Pro Tips

1. **Mobile First:** Always design and test mobile first
2. **Touch Targets:** When in doubt, make it bigger
3. **Real Devices:** Test on physical devices when possible
4. **User Zoom:** Allow users to zoom (accessibility)
5. **Orientation:** Always test both portrait and landscape
6. **Performance:** Check on slower devices/connections
7. **Accessibility:** Test with screen readers and keyboard
8. **Edge Cases:** Don't forget unusual screens (refrigerators!)

---

## 🎯 Success Criteria

✅ All rooms work on all device types  
✅ No horizontal scrolling (unless intended)  
✅ Touch targets ≥ 44px  
✅ Text remains readable at all sizes  
✅ No overlapping or clipped content  
✅ Smooth orientation changes  
✅ Accessible to all users  

---

**Quick Start:**
1. Open room file in browser
2. Press F12 → Device Toolbar
3. Test all preset devices
4. Check custom sizes
5. Test both difficulty levels

**Issues?** Check `RESPONSIVE_DESIGN_TESTING.md` for detailed troubleshooting.

---

*Last Updated: October 3, 2025*
