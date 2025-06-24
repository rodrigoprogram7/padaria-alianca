const bcrypt = require('bcrypt');

const senhaPura = 'padariafeliz5457'; // Troque essa senha pela sua escolha!

bcrypt.hash(senhaPura, 10).then(hash => {
  console.log('Senha criptografada:');
  console.log(hash);
});
