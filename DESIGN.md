---
name: NutriNation
description: Nourish Naturally. A refined, spare, premium dry-fruits store.
colors:
  primary: "#2D4A33"
  primary-deep: "#1E3423"
  orchard-olive: "#6F8F4E"
  honey-brown: "#946422"
  honey-gold: "#B9853C"
  honey-light: "#D2A866"
  terracotta: "#9C5B33"
  gallery-canvas: "#F5F3EE"
  surface-white: "#FFFFFF"
  warm-linen: "#EBE7DF"
  charcoal-ink: "#1D1C1A"
  stone-muted: "#6B675F"
  hairline: "#E4E0D8"
  hairline-strong: "#D3CEC3"
  cmd-bg: "#0B0F14"
  cmd-card: "#12171F"
  cmd-border: "#232A35"
  cmd-text: "#D0D7DE"
  cmd-muted: "#7D8590"
  cmd-accent: "#4BA3E3"
typography:
  display:
    fontFamily: "Inter Tight, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(1.75rem, 4.2vw, 4rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Inter Tight, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(2rem, 4.2vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Inter Tight, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Inter Tight, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "Inter Tight, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    letterSpacing: "-0.005em"
  eyebrow:
    fontFamily: "Inter Tight, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.08em"
  accent:
    fontFamily: "Fraunces, Georgia, serif"
    fontWeight: 400
    letterSpacing: "-0.01em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  2xl: "16px"
  3xl: "20px"
  frame: "22px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  gutter-desktop: "48px"
components:
  button-primary:
    backgroundColor: "{colors.charcoal-ink}"
    textColor: "{colors.surface-white}"
    typography: "{typography.label}"
    rounded: "{rounded.xl}"
    height: "40px"
    padding: "0 14px"
  button-primary-hover:
    backgroundColor: "#000000"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.xl}"
    height: "40px"
    padding: "0 16px"
  button-secondary-hover:
    backgroundColor: "{colors.charcoal-ink}"
    textColor: "{colors.surface-white}"
  weight-chip:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.stone-muted}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
  weight-chip-selected:
    backgroundColor: "{colors.charcoal-ink}"
    textColor: "{colors.surface-white}"
  input-search:
    backgroundColor: "{colors.warm-linen}"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.xl}"
    height: "40px"
    padding: "0 16px 0 40px"
  input-field:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.xl}"
    padding: "12px"
  card-product:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.2xl}"
    padding: "20px"
---

# Design System: NutriNation

## Overview

**Creative North Star: "The Harvest Gallery"**

NutriNation is a quiet gallery where the produce is the artwork and the interface is the wall. The mood is refined, spare and premium. A warm off-white canvas, tight charcoal headlines and very little colour step back so that large food photography, price and weight can carry the page.

Restraint is what makes it feel premium. Hierarchy comes from scale and tight tracking rather than colour or decoration, and detail shows up in small things: thin warm hairlines, dotted dividers, tabular prices and a soft underline on links.

The storefront is expressive where it persuades, mainly on the home page. The admin console uses the same palette and type at a working density, with a dark charcoal sidebar. The CMD console is a separate staff-only theme (see Colors).

**Key Characteristics:**
- Warm gallery-neutral canvas with charcoal ink.
- One typeface doing nearly all the work, set tight and large.
- Photography as the main source of colour.
- Actions in charcoal; green reserved for brand and selection.
- Flat surfaces with thin hairlines, lifting only when something floats.
- Slow, confident motion on one signature ease.

## Colors

A warm neutral palette, with forest green and honey tones drawn from the produce and used sparingly.

### Primary
- **Pistachio Forest** (`primary`): The one main accent. Used for links in text, selection, badges, the wordmark dot and keyboard focus outlines on buttons. It is an accent, not the action colour.
- **Deep Forest** (`primary-deep`): The darker green for rich dark panels and sections on the storefront.
- **Orchard Olive** (`orchard-olive`): A lighter green that replaces Pistachio Forest on dark surfaces, such as the active admin sidebar icon and the wordmark dot on charcoal.

### Secondary
- **Honey Brown** (`honey-brown`): Warm emphasis for small labels and highlights.
- **Honey Gold** (`honey-gold`): Decorative warmth and the only coloured shadow (see Elevation & Depth).
- **Light Honey** (`honey-light`): Honey on dark backgrounds and in chart series.

### Tertiary
- **Terracotta** (`terracotta`): Attention without alarm, such as low-stock warnings in the admin, and a chart series.

### Neutral
- **Gallery Canvas** (`gallery-canvas`): The page background everywhere on the storefront and admin. Never plain white.
- **Surface White** (`surface-white`): Cards, panels and forms sitting on the canvas.
- **Warm Linen** (`warm-linen`): Recessed surfaces such as the search field, image placeholders and skeletons.
- **Charcoal Ink** (`charcoal-ink`): All headings and main text, primary buttons, the announcement bar and the admin sidebar.
- **Stone** (`stone-muted`): Secondary text, captions and struck-through MRP.
- **Hairline** (`hairline`): Default borders and dividers.
- **Strong Hairline** (`hairline-strong`): Hover borders and scrollbar thumbs.

### CMD Theme
The `cmd-*` tokens belong to the CMD console only: a near-black background, a blue accent and monospace type, with its own green, amber and red status colours. It is a deliberate sibling theme for staff.

### Named Rules
**The Ink Acts Rule.** Primary actions are Charcoal Ink, not green. Pistachio Forest marks selection and brand; if green is doing the selling, the screen has too much of it.

**The Produce Is the Colour Rule.** Saturated colour comes from photography. Interface colour stays small enough that it never competes with the food.

**The Separate Rooms Rule.** CMD tokens never appear on the storefront or admin, and storefront tokens never restyle CMD.

## Typography

**Display Font:** Inter Tight (with system sans fallbacks)
**Accent Font:** Fraunces italic (with Georgia), soft and high optical size

**Character:** Inter Tight, set very tight at large sizes, gives a confident, contemporary editorial voice. Fraunces italic is the occasional warm aside.

### Hierarchy
- **Display** (`display`): Hero product names set over photography, in white.
- **Headline** (`headline`): Section headings. Page headings (`h1`–`h4`) default to weight 600 with -0.035em tracking and a 1.04 line height.
- **Title** (`title`): Product names on cards, clamped to two lines.
- **Body** (`body`): Default reading text. Product descriptions use a 1.65 line height.
- **Label** (`label`): Buttons, navigation (15px on desktop) and sentence-case section labels in Stone.
- **Eyebrow** (`eyebrow`): Small uppercase labels, such as the category above a product name. Use it for metadata only.
- **Prices**: Weight 600 with -0.02em tracking (17px on cards) and tabular numbers.

### Named Rules
**The One Voice Rule.** Inter Tight sets everything except the rare accent phrase. Fraunces italic is seasoning: a few words, never a full heading or paragraph.

**The Wordmark Rule.** The logo is "NutriNation" in Inter Tight bold at -0.055em tracking, followed by a small round dot in green. Caveat and Casanova are loaded but almost unused, so don't introduce them into new work.

## Layout

Content sits in a centred container up to 1440px wide, with gutters of 16px on phones, 24px from `sm` and 48px from `lg`. The hero is the exception: it runs nearly edge to edge, up to 1600px, as a row of tall photo panels where the active panel expands. On phones the panels stack.

The sticky header is 68px tall. On desktop, a floating dock appears after scrolling past 520px. On phones, a bottom navigation takes over.

Spacing is built in 4px steps. Product cards use 20px horizontal padding, and tight groups use 4–12px gaps. The storefront has generous section spacing, and the admin is denser, built from bordered white panels on the canvas.

Product images use a 5:4 ratio on cards. Product detail pages pair a large square image with a narrow buying column.

## Elevation & Depth

The system is flat until something floats. Surfaces at rest sit on the canvas with a hairline border or ring, and depth comes from tone: canvas, white, linen, ink. Shadows appear only on hover or on layers genuinely above the page, such as the mega menu, floating dock and back-to-top button.

### Shadow Vocabulary
- **Subtle** (`box-shadow: 0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.02)`): The barest separation for small elements.
- **Card** (`box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.02)`): Soft ambient lift for panels that need it.
- **Hover** (`box-shadow: 0 20px 40px -12px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.03)`): Product card hover and all floating layers.
- **Glow** (`box-shadow: 0 0 30px rgba(185,133,60,0.18)`): A rare honey glow. Decorative only.

### Named Rules
**The Flat Until It Floats Rule.** If a surface isn't being hovered and isn't above the page, it gets a hairline, not a shadow.

**The Opaque Surface Rule.** Surfaces are opaque. Background blur is limited to the sticky header, the floating dock and small chips that sit directly on photographs.

## Shapes

Corners are gently rounded and step up with size: 6–10px for small chips, 12px for buttons and inputs, 16px for cards and menus, 20px for large panels, and 22px for hero photo frames. Full circles are for icon buttons, count badges and avatars.

Dividers are thin hairlines, with a dotted rule for directory-style lists. Images are always clipped to their container's corners.

### Named Rules
**The Twelve Pixel Rule.** Buttons are 12px rounded rectangles. Pills are for status and small toggles, like the staff portal switcher. Square buttons are not part of the system. Existing pill and square buttons (`.btn-primary`, `.btn-ghost`, and "Continue to checkout" on the product page) predate this standard and should move to it when touched.

## Components

### Buttons
Quiet, solid and direct.
- **Shape:** Gently rounded rectangle (12px), 40px tall in the header and on product cards.
- **Primary:** Charcoal Ink with white text, weight 500, with an optional 16px leading icon.
- **Hover / Focus:** Hover deepens to black, and press scales to 0.98. Keyboard focus shows a 2px Pistachio Forest outline with 3px offset.
- **Secondary:** Transparent with a charcoal border, filling with charcoal on hover.
- **Disabled:** 45% opacity with a not-allowed cursor.

### Weight Selectors
- **Style:** Small 10px-radius chips on white with a hairline border and Stone text at 12px.
- **State:** Selected fills with Charcoal Ink and white text. Hover darkens the border and text.

### Cards / Containers
- **Corner Style:** 16px; admin panels and stat cards use 16–20px.
- **Background:** Surface White on Gallery Canvas.
- **Shadow Strategy:** None at rest; the Hover shadow appears on product card hover.
- **Border:** A 1px hairline or ring.
- **Internal Padding:** 20px on product cards, with hairline-separated rows for origin and price.

### Inputs / Fields
- **Style:** White with a hairline border, 12px radius. Search sits recessed on Warm Linen with a leading icon and turns white on focus.
- **Focus:** A 2px Charcoal Ink ring.
- **Error:** Short helper text in red beneath the field.
- **Floating fields:** Forms use a 56px field whose label sits inside it and shrinks upward on focus or when filled, including browser autofill. Focus turns the border Pistachio Forest. (Adapted from Watermelon UI's Floating Input.)

### Selection Cards
Whole-card radio choices for delivery and payment, on a real radio input so arrow keys work. White with a hairline at rest; the selected card gains a Pistachio Forest border. Unavailable options drop to the canvas with Stone text and say why. (Adapted from Watermelon UI's Radio Group 11.)

### Receipts
Order totals read like a till receipt: a white 20px-radius panel, dotted rules between groups, tabular numbers and one large total. Never a stack of cards.

### Navigation
- **Header:** Sticky on the canvas, gaining a hairline and light blur after scrolling. Links are 15px, weight 500, in ink at 75% strength, and full ink on hover or when active.
- **Mega menu:** A white 16px-radius panel with category thumbnails and a charcoal gift panel.
- **Mobile:** A bottom navigation with a menu in the header.
- **Breadcrumbs:** Not used. The header and page headings carry the wayfinding.
- **Admin:** A charcoal sidebar with 12px-radius items. The active item has an outline and an Orchard Olive icon.

### Harvest Gallery Hero
The signature component: tall 22px-radius photo panels in a row. The active panel expands to about five times its neighbours, showing its name in Display type and a thin progress line, while the others show a vertical label over a dark fade.

### Shelf (Sign-in)
Three tall 22px-radius photo panels beside the form, a quieter relative of the Harvest Gallery Hero. Each field widens its own panel as the customer moves down the form, over 900ms, with the product name in Fraunces italic on the active panel. On phones the panels become a short strip above the form.

### Category Banner
Category pages open on the banner image alone, with no text over it. The page keeps a visually hidden `h1` for screen readers and search.

### Dock
A floating dark desktop dock with 16px radius holding the home mark, category links and a light "Shop all" action. It is hidden at checkout.

### Loading States
Skeletons use Warm Linen with a slow moving sheen. Images show the same sheen until they load, and a failed image falls back to an icon with a short note.

### Motion
Motion uses one signature ease, `cubic-bezier(0.16, 1, 0.3, 1)`. Interface state changes take about 180–200ms, while images and scenes move slowly (700ms and up). Images zoom gently on hover, up to 1.05. All motion respects `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** let photography supply the colour, and keep it large and well cropped.
- **Do** use Charcoal Ink for primary actions and Pistachio Forest for selection, links and focus.
- **Do** use Gallery Canvas as the page background, with white reserved for surfaces on top of it.
- **Do** use 12px rounded rectangles for all new buttons.
- **Do** build hierarchy with size and tight tracking before reaching for colour.
- **Do** show prices with tabular numbers, with MRP in Stone beside the selling price.
- **Do** honour reduced motion on anything that animates.

### Don't:
- **Don't** add new pill or square buttons.
- **Don't** add shadows to surfaces at rest.
- **Don't** add glass effects; `.glass-panel` and `.glass-dark` are kept only for older components.
- **Don't** set headings or long text in Fraunces, or introduce Caveat or Casanova into new work.
- **Don't** use `cmd-*` colours or monospace styling on the storefront or admin.
- **Don't** use red except for errors and the wishlisted heart.
