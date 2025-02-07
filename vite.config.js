export default {
  build: {
    chunkSizeWarningLimit: 1000, // Increase from default 500kb to 1000kb
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-privy': ['@privy-io/react-auth'],
          'vendor-ethers': ['ethers']
        }
      }
    }
  }
}
