# **Pêndulo Simples**

## **1. Objetivo**
Descrever o funcionamento do pêndulo simples através de uma abordagem que combina simulações e análises para facilitar a compreensão das suas propriedades físicas.

---

## **2. Conceitos Chave**

### **Definição de um Pêndulo Simples**
Um pêndulo simples consiste em:
- Uma **massa (bob)** conectada a um fio ou haste.
- Um **ponto de suspensão**, permitindo que a massa oscile livremente.

**Suposições Adotadas:**
- O fio é **sem massa** e **inextensível**.  
- O sistema está sob uma **força gravitacional uniforme**.  
- Desconsidera-se a resistência do ar.

---

### **Equação do Movimento**

1. A equação geral que rege o movimento do pêndulo:  
   $$ \frac{d^2\theta}{dt^2} + \frac{g}{L} \sin(\theta) = 0 $$

2. Para **pequenos ângulos** (\(\sin(\theta) \approx \theta\)):  
   $$ \frac{d^2\theta}{dt^2} + \frac{g}{L} \theta = 0 $$

   Esta forma reduzida caracteriza o **movimento harmônico simples**, no qual o pêndulo oscila simetricamente em torno da posição de equilíbrio.

---

## **3. Relações e Efeitos**

### **Comprimento do Fio (\(L\))**
- O comprimento do fio é **inversamente proporcional** à frequência de oscilação.
- **Efeitos:**  
  - Aumentar \(L\) **aumenta o período** (ciclo mais lento).  
  - Diminuir \(L\) **reduz o período** (ciclo mais rápido).  
- **Equação do Período (\(T\)):**  
  $$ T = 2\pi \sqrt{\frac{L}{g}} $$  
  Onde:  
  - \(T\): Período (tempo para um ciclo completo).  
  - \(L\): Comprimento do fio.  
  - \(g\): Aceleração gravitacional.

---

### **Aceleração Gravitacional (\(g\))**
- A aceleração gravitacional **influencia diretamente a velocidade de oscilação**.  
- **Efeitos:**  
  - Aumentar \(g\) **acelera o pêndulo** (ciclos mais rápidos).  
  - Reduzir \(g\) **desacelera o pêndulo** (ciclos mais lentos).

---

### **Amplitude (\(\theta_0\))**
- O **ângulo inicial** (\(\theta_0\)) determina a altura inicial do pêndulo.  
- **Efeitos:**  
  - Para **ângulos pequenos** (\(< 15^\circ\)), o movimento é harmônico e o período é constante.  
  - Para **ângulos grandes**, a aproximação \(\sin(\theta) \approx \theta\) não é válida, resultando em **movimento não linear** e ligeiro aumento no período.

---

### **Massa da Bobina (\(m\))**
- A **massa da bobina não altera o período** ou a frequência do pêndulo (negligenciando a resistência do ar).  
- Isso ocorre porque a força restauradora (gravidade) e a inércia aumentam proporcionalmente com a massa, anulando sua influência.

---

## **4. Aplicações Práticas**

### **Utilizações no Dia a Dia**
1. **Medida de Tempo:**  
   - Relógios de pêndulo aproveitam o período constante do pêndulo para cronometragem precisa.

2. **Engenharia:**  
   - Aplicado no design de estruturas resistentes a vibrações (e.g., pontes e edifícios).

3. **Sismologia:**  
   - Pêndulos são usados para detectar e medir movimentos sísmicos.

4. **Experimentos de Física:**  
   - Determinação da aceleração gravitacional local (\(g\)).

---

## **5. Conclusão**
O estudo do pêndulo simples oferece um exemplo clássico de **movimento periódico previsível**, conectando conceitos teóricos a aplicações práticas na engenharia e na ciência. Ele proporciona uma base para compreender oscilações e sistemas dinâmicos.



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
     
     
         
