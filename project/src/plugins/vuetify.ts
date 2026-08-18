import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.min.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

/** Sade e-ticaret paleti: mavi primary, nötr yüzeyler, yüksek kontrast metin */
const customLightTheme = {
  dark: false,
  colors: {
    primary: '#2563EB',
    'primary-dark': '#1D4ED8',
    'primary-light': '#EFF6FF',
    secondary: '#64748B',
    'secondary-dark': '#475569',
    'secondary-light': '#F1F5F9',
    accent: '#2563EB',
    'accent-dark': '#1D4ED8',
    'accent-light': '#DBEAFE',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    'surface-variant': '#F1F5F9',
    'surface-bright': '#FFFFFF',
    error: '#DC2626',
    'error-light': '#FEE2E2',
    success: '#16A34A',
    'success-light': '#DCFCE7',
    warning: '#D97706',
    'warning-light': '#FEF3C7',
    info: '#0284C7',
    'info-light': '#E0F2FE',
    'on-background': '#0F172A',
    'on-surface': '#0F172A',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-accent': '#FFFFFF',
    border: '#E2E8F0',
    divider: '#E2E8F0',
    hover: '#F1F5F9',
    disabled: '#94A3B8',
    star: '#F59E0B',
  },
}

const customDarkTheme = {
  dark: true,
  colors: {
    primary: '#3B82F6',
    'primary-dark': '#2563EB',
    'primary-light': '#1E3A5F',
    secondary: '#94A3B8',
    'secondary-dark': '#64748B',
    'secondary-light': '#334155',
    accent: '#3B82F6',
    'accent-dark': '#2563EB',
    'accent-light': '#1E3A5F',
    background: '#0F172A',
    surface: '#1E293B',
    'surface-variant': '#334155',
    'surface-bright': '#273449',
    error: '#F87171',
    'error-light': '#7F1D1D',
    success: '#4ADE80',
    'success-light': '#14532D',
    warning: '#FBBF24',
    'warning-light': '#78350F',
    info: '#38BDF8',
    'info-light': '#0C4A6E',
    'on-background': '#F8FAFC',
    'on-surface': '#F1F5F9',
    'on-primary': '#FFFFFF',
    'on-secondary': '#0F172A',
    'on-accent': '#FFFFFF',
    border: '#475569',
    divider: '#475569',
    hover: '#334155',
    disabled: '#64748B',
    star: '#FBBF24',
  },
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: customLightTheme,
      dark: customDarkTheme,
    },
  },
  display: {
    mobileBreakpoint: 'md',
  },
  defaults: {
    global: {
      ripple: true,
    },
    VContainer: {
      maxWidth: 'xl',
    },
    VCard: {
      rounded: 'lg',
      elevation: 1,
      color: 'surface',
    },
    VBtn: {
      rounded: 'lg',
      fontWeight: '600',
    },
    VTextField: {
      rounded: 'lg',
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
    },
    VSelect: {
      rounded: 'lg',
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
    },
    VAutocomplete: {
      rounded: 'lg',
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
    },
    VChip: {
      rounded: 'lg',
    },
  },
})
