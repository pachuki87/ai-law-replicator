const ngrok = require('ngrok');

async function startNgrok() {
  try {
    console.log('🚀 Iniciando ngrok para exponer la aplicación...');
    
    // Configuración de ngrok
    const url = await ngrok.connect({
      port: 5173,
      proto: 'http',
      region: 'us', // Puedes cambiar a 'eu', 'ap', 'au', 'sa', 'jp', 'in'
      bind_tls: true, // Habilita HTTPS
      inspect: false, // Deshabilita la interfaz de inspección
      onStatusChange: status => {
        console.log(`📊 Estado de ngrok: ${status}`);
      },
      onLogEvent: data => {
        console.log(`📝 Log de ngrok: ${data}`);
      }
    });

    console.log('✅ ¡Ngrok iniciado exitosamente!');
    console.log('🌐 URL pública:', url);
    console.log('🏠 URL local: http://localhost:5173');
    console.log('');
    console.log('📋 Información importante:');
    console.log('   • La aplicación está ahora accesible públicamente');
    console.log('   • Comparte la URL pública para acceso remoto');
    console.log('   • Presiona Ctrl+C para detener ngrok');
    console.log('');

    // Mantener el proceso activo
    process.on('SIGINT', async () => {
      console.log('\n🛑 Deteniendo ngrok...');
      await ngrok.kill();
      console.log('✅ Ngrok detenido correctamente');
      process.exit(0);
    });

    // Mantener el proceso vivo
    setInterval(() => {
      // Verificar que ngrok sigue activo
    }, 30000);

  } catch (error) {
    console.error('❌ Error al iniciar ngrok:', error.message);
    
    if (error.message.includes('authtoken')) {
      console.log('');
      console.log('🔑 Necesitas configurar tu authtoken de ngrok:');
      console.log('   1. Regístrate en https://ngrok.com/');
      console.log('   2. Obtén tu authtoken del dashboard');
      console.log('   3. Ejecuta: npx ngrok authtoken TU_TOKEN');
      console.log('   4. Vuelve a ejecutar este script');
    }
    
    process.exit(1);
  }
}

// Verificar si el puerto 5173 está disponible
const net = require('net');
const server = net.createServer();

server.listen(5173, (err) => {
  if (err) {
    console.log('✅ Puerto 5173 está en uso (aplicación ejecutándose)');
    server.close();
    startNgrok();
  } else {
    console.log('❌ Puerto 5173 no está en uso');
    console.log('🚨 Asegúrate de que la aplicación esté ejecutándose en http://localhost:5173');
    console.log('💡 Ejecuta: npm run dev');
    server.close();
    process.exit(1);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('✅ Puerto 5173 está en uso (aplicación ejecutándose)');
    startNgrok();
  } else {
    console.error('❌ Error verificando puerto:', err.message);
    process.exit(1);
  }
});