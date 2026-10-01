export const metadata = {
  title: 'Local AI Assistant',
  description: 'Private AI assistant that runs locally and does not require API keys.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
