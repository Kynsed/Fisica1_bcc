# **Pêndulo Simples**

## **1. Objetivo**
Explicar o funcionamento do pêndulo simples utilizando uma abordagem que analisa os resultados simulados para promover uma compreensão intuitiva de suas propriedades físicas.

---

## **2. Conceitos Chave**

### **Definição de um Pêndulo Simples**
O pêndulo simples consiste em:
- Uma **massa (bob)** presa a um fio ou haste.
- Um **ponto de suspensão**, permitindo que a massa oscile livremente.

**Suposições:**
- O fio é **sem massa** e **inextensível**.  
- O sistema está sob uma **força gravitacional uniforme**.  
- Não há resistência do ar.

---

### **Equação do Movimento**

1. A equação geral que descreve o movimento do pêndulo:  
   $$ \frac{d^2\theta}{dt^2} + \frac{g}{L} \sin(\theta) = 0 $$

2. Para **pequenos ângulos** (\(\sin(\theta) \approx \theta\)):  
   $$ \frac{d^2\theta}{dt^2} + \frac{g}{L} \theta = 0 $$

   Esta é a equação do **movimento harmônico simples**, onde o pêndulo oscila simetricamente ao redor da posição de equilíbrio.

---

## **3. Relações e Efeitos**

### **Comprimento do Fio (\(L\))**
- O comprimento do fio é **inversamente proporcional** à frequência da oscilação.
- **Efeito:**  
  - Aumentar \(L\) aumenta o tempo do ciclo (*período aumenta*).  
  - Diminuir \(L\) reduz o tempo do ciclo (*período diminui*).  
- **Equação para o Período (\(T\)):**  
  $$ T = 2\pi \sqrt{\frac{L}{g}} $$  
  Onde:
  - \(T\): Período (tempo para um ciclo completo)  
  - \(L\): Comprimento do fio  
  - \(g\): Aceleração gravitacional  

---

### **Aceleração Gravitacional (\(g\))**
- A aceleração gravitacional **afeta diretamente a velocidade da oscilação**.  
- **Efeito:**  
  - Aumentar \(g\) faz o pêndulo oscilar mais rápido.  
  - Diminuir \(g\) faz o pêndulo oscilar mais devagar.

---

### **Amplitude (\(\theta_0\))**
- O **ângulo inicial** (\(\theta_0\)) determina a altura inicial do pêndulo.  
- **Efeito:**  
  - Para **pequenos ângulos** (\(< 15^\circ\)), o movimento é harmônico, e o período é constante.  
  - Para **grandes ângulos**, a aproximação \(\sin(\theta) \approx \theta\) não é válida, e o movimento torna-se **não linear**, aumentando ligeiramente o período.

---

### **Massa da Bobina (\(m\))**
- A **massa da bobina não afeta o período** ou a frequência do pêndulo (se a resistência do ar for negligenciada).  
- Isso ocorre porque a força restauradora (gravidade) e a inércia são proporcionais à massa, anulando sua influência.

---

## **4. Importância Prática**

### **Aplicações no Dia a Dia**
1. **Medida de Tempo:**  
   - Relógios de pêndulo usam o período constante do pêndulo para medir o tempo com precisão.

2. **Engenharia:**  
   - Projetos estruturais para resistir a vibrações (e.g., pontes e edifícios).

3. **Sismologia:**  
   - Pêndulos detectam e medem movimentos sísmicos.

4. **Experimentos de Física:**  
   - Determinação da aceleração gravitacional local (\(g\)).

---

## **5. Conclusão**
O pêndulo simples é um modelo de **movimento periódico previsível**, proporcionando insights fundamentais sobre mecânica e oscilações. Seu estudo conecta fenômenos teóricos a aplicações práticas em engenharia e ciência.


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
        - Agora vamos criar um link simbolico. Abra o cmd como administrador e digite o comando mklink esbuild node_modules\esbuild\bin\esbuild
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
     
     
         
