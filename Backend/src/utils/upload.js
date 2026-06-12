const multer = require('multer');
const path = require('path');
const fs = require('fs');

// o multer NAO cria a pasta de destino sozinho: sem isso o primeiro upload
// em uma instalacao nova falharia com ENOENT
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({ // define onde e como salvar o arquivo
    destination: (req, file, cb) => {// o destination apaonta para a pasta destination e o filename gera um nome unico utilizando o timestamp atual evitando conflito de nomes
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const extensao = path.extname(file.originalname);
        const nomeArquivo = `foto_${Date.now()}${extensao}`; // o datenow aqui vai servir para gerar um numero baseado no tempo atual em milessegundos, isso vai garantir que cada arquivo tenha um nome unico
        cb(null, nomeArquivo);
    }
});

const fileFilter = (req, file, cb) => { //vai bloquear qualquer arquivo que nao seja imagem, se tentarem mandar um arquivo exe ou pdf o multer vai rejeitar antes de salvar
    const tiposPermitidos = /jpeg|jpg|png|webp/;
    const extensaoValida = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
    const mimetypeValido = tiposPermitidos.test(file.mimetype);

    if (extensaoValida && mimetypeValido) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, webp).'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // limita o tamanho do arquivo para 5MB
});

module.exports = upload;