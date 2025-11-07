import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zarr Cesium',
  description: 'A Zarr layer handler for CesiumJS',
  openGraph: {
    type: 'website',
    siteName: 'Zarr Cesium',
    title: 'Zarr Cesium',
    description: 'A Zarr layer handler for CesiumJS'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
