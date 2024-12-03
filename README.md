# Fisica1_bcc

Projeto final de Fisica I escrito em JavaScript para construir uma simulação de pendulo com interaçao em tempo real.

# Compilação

Neste tópico abordaremos a compilação e execução do programa apenas em ambiente Microsoft Windows.

Para compilar:

  1. Faça o download do repositório clicando em Code -> Download Zip

  2. Instale as ferramentas necessárias

      NodeJs:
         - Execute o instalador com todas as opções na forma default.

      Criando o arquivo package.json:
       - Abra o PowerShell
       - Com o comando cd -PATH-, substitua -PATH- pelo caminho do repositório baixado na instrução 1. Gere o arquivo package.json com o comando: npm init -y

     Typescript:
         - Instale globalmente com o comando : npm install -g typescript
         -Instale o Typescript no diretorio do projeto com o comando: npm install typescript --save-dev
         - Certifique que o Typescript foi instalado corretamente, isso pode ser feito verificando a versão atraves do comando tsc --version.
         - Vamos criar um alias com o comando: alias tsc="*diretorio_do_projeto*\node_modules\typescipt\bin\tsc"

     Esbuild
        - Instale o esbbuild no diretorio do projeto com o comando npm install --save-exact --save-dev esbuild
        - Agora vamos criar um link simbolico com o comando ln -s node_modules/esbuild/bin/esbuild esbuild
        - Verifique se foi instalado e criado corretamente com o comando ./esbuild --version
    
     Perl
       - Baixe o arquivo msi e faca a instalacao padrao
       - Verfique a instalacao com o comando perl --version
    
     Make
       - Baixe e instale GNU Make
       - VErfique a instalacao com o comando make --version

  3. Execute o comando tsc para compilar os arquivo .ts em .js

  4. Execute o comando make para compilar o html

  5. Na pasta build, abra o arquivo index-en.html
     
     
         
