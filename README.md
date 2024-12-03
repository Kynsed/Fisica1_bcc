# **A Dinâmica do Pêndulo**

Projeto final de Fisica I escrito em JavaScript

## ** Descrição básica do projeto**

Este projeto é uma simulação criada para ilustrar o comportamento de um pêndulo simples na Física. O objetivo é fornecer uma visualização gráfica do movimento oscilatório, permitindo o estudo e a compreensão dos conceitos envolvidos. A simulação mostra a trajetória de um pêndulo oscilando em diferentes condições, como variações no comprimento da corda e na gravidade.
![p](https://github.com/user-attachments/assets/1ebc66e5-7cb8-4064-b6cc-947c417c39c7)

---

## ** Conceitos**

### **Definição de um Pêndulo Simples**
Um pêndulo simples é um sistema ideal que consiste de uma partícula suspensa por um fio inextensível e leve. Quando afastado de sua posição de equilibrio e solto, o pêndulo oscilará em um plano vertical sob à ação da gravidade.
O pêndulo simples é um exemplo clássico de movimento harmônico simples (para pequenos ângulos) quando desprezamos forças resistivas como atrito. 

**Suposições Adotadas:**
- O fio é **sem massa** e **inextensível**.  
- O sistema está sob uma **força gravitacional uniforme**.  
- Desconsidera-se a resistência do ar.

---

## **3. Equação do Movimento**

1. A equação geral que rege o movimento do pêndulo:  

![p](https://github.com/user-attachments/assets/e0fe851a-274a-4b1c-84ac-072ec8f04195)


2. Para **pequenos ângulos** (sin(θ) ≈ θ):  


   Esta forma reduzida caracteriza o **movimento harmônico simples**, no qual o pêndulo oscila simetricamente em torno da posição de equilíbrio.

---


## **4. Relações e Efeitos**

### **Comprimento do Fio (L)**
- O comprimento do fio é **inversamente proporcional** à frequência de oscilação.
- **Efeitos:**  
- Aumentar L **aumenta o período** (ciclo mais lento).  
- Diminuir L **reduz o período** (ciclo mais rápido).  
- **Equação do Período (T):**   
  T = 2π * sqrt(L / g)

  
Onde:  
- T: Período (tempo para um ciclo completo).  
- L: Comprimento do fio.  
- g: Aceleração gravitacional.

---

### **Aceleração Gravitacional (g)**
- A aceleração gravitacional **influencia diretamente a velocidade de oscilação**.  
- **Efeitos:**  
- Aumentar g **acelera o pêndulo** (ciclos mais rápidos).  
- Reduzir g **desacelera o pêndulo** (ciclos mais lentos).

---

### **Amplitude (θ₀)**
- O **ângulo inicial** (θ₀) determina a altura inicial do pêndulo.  
- **Efeitos:**  
- Para **ângulos pequenos** (< 15°), o movimento é harmônico e o período é constante.  
- Para **ângulos grandes**, a aproximação sin(θ) ≈ θ não é válida, resultando em **movimento não linear** e ligeiro aumento no período.

---

### **Massa da Bobina (m)**
- A **massa da bobina não altera o período** ou a frequência do pêndulo (negligenciando a resistência do ar).  
- Isso ocorre porque a força restauradora (gravidade) e a inércia aumentam proporcionalmente com a massa, anulando sua influência.

---

## **5. Aplicações Práticas**

### **Utilizações no Dia a Dia**
1. **Medida de Tempo:**  
- Relógios de pêndulo aproveitam o período constante do pêndulo para cronometragem precisa.

2. **Engenharia:**  
- Bolas de demolição utilizam princípios semelhantes para maximizar impacto.

3. **Sismologia:**  
- Pêndulos são usados para detectar e medir movimentos sísmicos.

4. **Experimentos de Física:**  
- Determinação da aceleração gravitacional local (g).

---

## **6. Conclusão**

Este projeto é uma aplicação prática dos conceitos teóricos de movimento oscilatório, permitindo explorar as propriedades fundamentais do pêndulo simples por meio de uma abordagem interativa.



# Compilação

Neste tópico abordaremos a compilação e execução do programa apenas em ambiente Microsoft Windows.

Para compilar:

  1. Baixe o repositório
      Clique em Code -> Download ZIP para obter os arquivos do projeto.

  2. Instale as ferramentas necessárias

       [Node.js](https://nodejs.org/en)
         Execute o instalador com todas as opções padrão.

      Criando o arquivo package.json:
       - Abra o PowerShell
       - Execute o comando cd -PATH- (substitua -PATH- pelo caminho do repositório baixado na instrução 1).
       - Gere o arquivo package.json com o comando: ```npm init -y```

     Typescript
       - Instale globalmente com o comando  ```npm install -g typescript```
       - Instale o Typescript localmente ```npm install typescript --save-dev```
       - Certifique-se que o Typescript foi instalado corretamente através do comando ```tsc --version```.
       - Criando um alias: ```alias tsc="*diretorio_do_projeto*\node_modules\typescipt\bin\tsc"```     

     Esbuild
        - Instale o esbuild localmente ```npm install --save-exact --save-dev esbuild```
        - Vamos criar um link simbólico. Abra o cmd como administrador e execute
                  ```mklink esbuild node_modules\esbuild\bin\esbuild```
        - Verifique se foi criado corretamente com o comando ```./esbuild --version```
    
     [Perl](https://strawberryperl.com/)
       - Baixe o arquivo .msi e faça a instalação padrão
       - Verfique a instalação com o comando ```perl --version```
    
     [GNU Make](https://www.gnu.org/software/make/)
       - Baixe e instale GNU Make
       - Verifique a instalação com o comando ```make --version```

  4. Execute o comando ```tsc``` para compilar os arquivo .ts em .js

  5. Execute o comando ```make``` para gerar o .html

  6. Abra o diretório do projeto -> build, abra o arquivo index-en.html para inciar a simulação
     
     
         

     
     
         
