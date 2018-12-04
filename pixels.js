var Canvas = function(width, height){
  this.canvas = document.createElement("canvas");
  this.canvas.height = height;
  this.canvas.width = width;

  this.ctx = this.canvas.getContext("2d");
};
Canvas.prototype.limpar = function(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Canvas.prototype.carregarImagem = function(img){
  this.limpar();
  this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);// img, x (inicial), y(inicial), width, height
};

Canvas.prototype.getPixels = function(){
  return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
};

Canvas.prototype.rotacionar = function(dados){

  var dataMatriz = [];
  dataMatriz = this.toMatrizFromArray(dados);

  // Invertendo o array de arrays e arrays
  var dataMatrizInversa = [];

  for (var i = 0; i < dataMatriz.length ; i++) {
    dataMatrizInversa[i] = [];
    for (var j = 0; j < dataMatriz.length; j++) {
      dataMatrizInversa[i][j] = dataMatriz[dataMatriz.length-1-j][i];
    };
  };

  var vetorFinal = [];
  vetorFinal = this.toArrayFromMatriz(dataMatrizInversa);

  var dados = this.toUintArray(vetorFinal);

  this.putPixels(dados);
};

Canvas.prototype.toUintArray = function(array){
  var dados = this.ctx.createImageData(this.canvas.width, this.canvas.height);
  dados.data.set(array);

  return dados;
};

Canvas.prototype.toMatrizFromArray = function(dados){
  var dataMatriz = [];
  var dataArray = [];
  var pixel = [];
  var condicionalWidth = dados.width;
  var contador = 1

  // Montando o array de arrays de arrays
  for(var i=0, len = dados.data.length; i<len; i++){
    pixel.push(dados.data[i]);

    if (contador == 4) {
      dataArray.push(pixel);
      pixel = [];
      contador = 1;
    }
    else {
      contador ++;
    };

    if (i+1  == condicionalWidth * 4) {
      dataMatriz.push(dataArray);
      dataArray = [];
      condicionalWidth += dados.width;
    };
  };
  return dataMatriz;
}

Canvas.prototype.toArrayFromMatriz = function(matriz){
  var vetorFinal = [];
  var vetorAux = [];
  var contador = 0;

  for (var linha = 0; linha < matriz.length; linha++) {
    for (var coluna = 0; coluna < matriz[linha].length; coluna++) {
      vetorAux = matriz[linha][coluna];
      for (var k = 0; k < 4; k++) {
        vetorFinal.push(vetorAux[k]);
      };
    };
  };

  return vetorFinal;
}

Canvas.prototype.inverter = function(dados){
  for (var i = 0, len = dados.data.length; i < len; i+=4) {
    dados.data[i] = 255 - dados.data[i]
    dados.data[i+1] = 255 - dados.data[i+1]
    dados.data[i+2] = 255 - dados.data[i+2]
    // dados.data[i+3] = dados.data[i+3]
  }
  this.putPixels(dados);
};

Canvas.prototype.putPixels = function(dados){
  this.limpar();
  this.ctx.putImageData(dados, 0, 0);
};

Canvas.prototype.mediana = function(dados, matriz){

  var dataMatriz = [];
  dataMatriz = this.toMatrizFromArray(dados);

  for (var linha = 1; linha < dados.width-1; linha++) {
    for (var coluna = 1; coluna < dados.height-1; coluna++) {
      var vetorMediana = [];
      for (var i = linha-1; i <= linha+1; i++) {
        for (var j = coluna-1; j <= coluna+1; j++) {
          vetorMediana.push(matriz[i][j]);
        };
      };

      vetorMediana.sort(function(a, b) {return a-b});

      var vetorRGBA = [];
      for (var i = linha-1; i <= linha+1; i++) {
        for (var j = coluna-1; j <= coluna+1; j++) {
          if (vetorMediana[4] == matriz[i][j]) {
            vetorRGBA = dataMatriz[i][j];
          }
        };
      };

      dataMatriz[linha][coluna] = vetorRGBA;
    };
  };
  var vetorFinal = [];
  vetorFinal = this.toArrayFromMatriz(dataMatriz);

  var data = this.toUintArray(vetorFinal);
  this.putPixels(data);
};

Canvas.prototype.toPixelMatriz = function(dados){

  var pixel;
  var pixelsArray = [];
  var pixelsMatriz = [];

  var condicionalWidth = dados.width; //Condicional de divisão do vetor resultando em uma matriz
  var linhaImpressao = 25; // linha de impressão do método fillText

  for(var i=0, len = dados.data.length; i<len; i+=4){ //Impressão dos dados
    var vermelho = dados.data[i];
    var verde = dados.data[i+1];
    var azul = dados.data[i+2];

    //Weighted conversion https://sites.google.com/site/learnimagej/tutorials/converting-image-formats
    var vermelhoConvertido = (29.9 * vermelho)/100;
    var verdeConvertido = (58.7 * verde)/100;
    var azulConvertido = (11.4 * azul)/100;
    var pixel = parseInt(vermelhoConvertido + verdeConvertido + azulConvertido);


    //Conversão simples
    // var conversaoSimples = (vermelho+verde+azul)/3;
    // var pixel = parseInt(conversaoSimples);

    pixelsArray.push(pixel);

    if ((i/4)+1  == condicionalWidth) {
      pixelsMatriz.push(pixelsArray);
      pixelsArray = [];
      condicionalWidth += dados.width;
    }
  }

  return pixelsMatriz;
};

Canvas.prototype.somarImagens = function(canvas, canvasTwo, resultadoCanvas){
  var dados = canvas.getPixels();
  dados = this.toMatrizFromArray(dados);

  var dadosTwo = canvasTwo.getPixels();
  dadosTwo = this.toMatrizFromArray(dadosTwo);

  var matrizAux = [];

  for (var linha = 0; linha < dados.length; linha++) {
    var vetorExterno = [];
    for (var coluna = 0; coluna < dados[linha].length; coluna++) {
      var vetorDados = dados[linha][coluna];
      var vetorDadosTwo = dadosTwo[linha][coluna];
      var vetorInterno = [];

      for (var k = 0; k < 4; k++) {
        vetorInterno.push(parseInt((vetorDados[k]+vetorDadosTwo[k])/2));
      }
      vetorExterno.push(vetorInterno);
    }
    matrizAux.push(vetorExterno);
  }

  var vetorResultante = this.toArrayFromMatriz(matrizAux);
  var dadoResultante = this.toUintArray(vetorResultante);
  resultadoCanvas.putPixels(dadoResultante);
};

Canvas.prototype.toRed = function(dados){

  var matriz = this.toMatrizFromArray(dados);

  for (var linha = 0; linha < matriz.length; linha++) {
    for (var coluna = 0; coluna < matriz[linha].length; coluna++) {
      var vetorAux = matriz[linha][coluna];
      vetorAux[0] = vetorAux[0];
      vetorAux[1] = 0;
      vetorAux[2] = 0;
    }
  }

  var vetorResultante = this.toArrayFromMatriz(matriz);
  var dadoResultante = this.toUintArray(vetorResultante);
  this.putPixels(dadoResultante);
};

Canvas.prototype.toGreen = function(dados){

  var matriz = this.toMatrizFromArray(dados);

  for (var linha = 0; linha < matriz.length; linha++) {
    for (var coluna = 0; coluna < matriz[linha].length; coluna++) {
      var vetorAux = matriz[linha][coluna];
      vetorAux[0] = 0;
      vetorAux[1] = vetorAux[1];
      vetorAux[2] = 0;
    }
  }

  var vetorResultante = this.toArrayFromMatriz(matriz);
  var dadoResultante = this.toUintArray(vetorResultante);
  this.putPixels(dadoResultante);
};

Canvas.prototype.toBlue = function(dados){

  var matriz = this.toMatrizFromArray(dados);

  for (var linha = 0; linha < matriz.length; linha++) {
    for (var coluna = 0; coluna < matriz[linha].length; coluna++) {
      var vetorAux = matriz[linha][coluna];
      vetorAux[0] = 0;
      vetorAux[1] = 0;
      vetorAux[2] = vetorAux[2];
    }
  }

  var vetorResultante = this.toArrayFromMatriz(matriz);
  var dadoResultante = this.toUintArray(vetorResultante);
  this.putPixels(dadoResultante);
};

Canvas.prototype.stanford = function (dados, matriz){
  var dataMatriz = this.toMatrizFromArray(dados);

  for (var linha = 2; linha < dados.width-2; linha++) {
    for (var coluna = 2; coluna < dados.height-2; coluna++) {
      for (var i = linha-2; i <= linha+2; i++) {
        for (var j = coluna-2; j <= coluna+2; j++) {

        };
      };
    };
  };

  var vetorResultante = this.toArrayFromMatriz(dataMatriz);
  var dadoResultante = this.toUintArray(vetorResultante);
  this.putPixels(dadoResultante);
};

Canvas.prototype.dilatar = function(dados, matriz){
  var dataMatriz = this.toMatrizFromArray(dados);
  var dataMatrizAux = dataMatriz;


  for (var linha = 0; linha < dados.width; linha++) {
    for (var coluna = 0; coluna < dados.height; coluna++) {

      if (linha == 0 & coluna == 0) {
        if (matriz[linha][coluna] == 0) {
          for (var i = linha; i <= linha+1; i++) {
            for (var j = coluna; j <= coluna+1; j++) {
              var vetorRGBA = dataMatriz[i][j];
              vetorRGBA[0] = 0;
              vetorRGBA[1] = 0;
              vetorRGBA[2] = 0;
              dataMatrizAux[i][j] = vetorRGBA;
            };
          };
        };
      } else if (linha == 0 & coluna == dados.height-1) {
        if (matriz[linha][coluna] == 0) {
          for (var i = linha; i <= linha+1; i++) {
            for (var j = coluna-1; j <= coluna; j++) {
              var vetorRGBA = dataMatriz[i][j];
              vetorRGBA[0] = 0;
              vetorRGBA[1] = 0;
              vetorRGBA[2] = 0;
              dataMatrizAux[i][j] = vetorRGBA;
            };
          };
        };
      }else if (linha == dados.width-1 & coluna == 0) {
        if (matriz[linha][coluna] == 0) {
          for (var i = linha-1; i <= linha; i++) {
            for (var j = coluna; j <= coluna+1; j++) {
              var vetorRGBA = dataMatriz[i][j];
              vetorRGBA[0] = 0;
              vetorRGBA[1] = 0;
              vetorRGBA[2] = 0;
              dataMatrizAux[i][j] = vetorRGBA;
            };
          };
        };
      }else if (linha == dados.width-1 & coluna == dados.height-1) {
        if (matriz[linha][coluna] == 0) {
          for (var i = linha-1; i <= linha; i++) {
            for (var j = coluna-1; j <= coluna; j++) {
              var vetorRGBA = dataMatriz[i][j];
              vetorRGBA[0] = 0;
              vetorRGBA[1] = 0;
              vetorRGBA[2] = 0;
              dataMatrizAux[i][j] = vetorRGBA;
            };
          };
        };
      }else if (linha == 0) {
        if (matriz[linha][coluna] == 0) {
          for (var i = linha; i <= linha+1; i++) {
            for (var j = coluna-1; j <= coluna+1; j++) {
              var vetorRGBA = dataMatriz[i][j];
              vetorRGBA[0] = 0;
              vetorRGBA[1] = 0;
              vetorRGBA[2] = 0;
              dataMatrizAux[i][j] = vetorRGBA;
            };
          };
        };
      }else if (linha == dados.width-1) {
        if (matriz[linha][coluna] == 0) {
          for (var i = linha-1; i <= linha; i++) {
            for (var j = coluna-1; j <= coluna+1; j++) {
              var vetorRGBA = dataMatriz[i][j];
              vetorRGBA[0] = 0;
              vetorRGBA[1] = 0;
              vetorRGBA[2] = 0;
              dataMatrizAux[i][j] = vetorRGBA;
            };
          };
        };
      }else if (coluna == 0) {
        if (matriz[linha][coluna] == 0) {
          for (var i = linha-1; i <= linha+1; i++) {
            for (var j = coluna; j <= coluna+1; j++) {
              var vetorRGBA = dataMatriz[i][j];
              vetorRGBA[0] = 0;
              vetorRGBA[1] = 0;
              vetorRGBA[2] = 0;
              dataMatrizAux[i][j] = vetorRGBA;
            };
          };
        };
      }else if (coluna == dados.height-1) {
        if (matriz[linha][coluna] == 0) {
          for (var i = linha-1; i <= linha+1; i++) {
            for (var j = coluna-1; j <= coluna; j++) {
              var vetorRGBA = dataMatriz[i][j];
              vetorRGBA[0] = 0;
              vetorRGBA[1] = 0;
              vetorRGBA[2] = 0;
              dataMatrizAux[i][j] = vetorRGBA;
            };
          };
        };
      }else {
        if (matriz[linha][coluna] == 0) {
          for (var i = linha-1; i <= linha+1; i++) {
            for (var j = coluna-1; j <= coluna+1; j++) {
              var vetorRGBA = dataMatriz[i][j];
              vetorRGBA[0] = 0;
              vetorRGBA[1] = 0;
              vetorRGBA[2] = 0;
              dataMatrizAux[i][j] = vetorRGBA;
            };
          };
        };//fim do if
      };//fim do else
    };// for coluna
  };//for linha

  var vetorResultante = this.toArrayFromMatriz(dataMatrizAux);
  var dadoResultante = this.toUintArray(vetorResultante);
  this.putPixels(dadoResultante);
};

Canvas.prototype.erodir = function(dados, matriz){
  var dataMatriz = this.toMatrizFromArray(dados);
  var dataMatrizAux = dataMatriz;
  dataMatrizAux = this.white(dataMatrizAux,dados);


  for (var linha = 1; linha < dados.width-1; linha++) {
    for (var coluna = 1; coluna < dados.height-1; coluna++) {

      if (matriz[linha][coluna] <= 10) {
        if (matriz[linha-1][coluna]<=10 & matriz[linha][coluna-1] <= 10 & matriz[linha-1][coluna-1] <= 10 & matriz[linha][coluna+1] <=10 & matriz[linha+1][coluna] <= 10) {
          var vetorRGBA = dataMatriz[linha][coluna];
          vetorRGBA[0] = 0;
          vetorRGBA[1] = 0;
          vetorRGBA[2] = 0;

          dataMatrizAux[linha][coluna] = vetorRGBA;
        };
      };
    };
  };

  var vetorResultante = this.toArrayFromMatriz(dataMatrizAux);
  var dadoResultante = this.toUintArray(vetorResultante);
  this.putPixels(dadoResultante);
};

Canvas.prototype.white = function(dataMatriz,dados){

  for (var linha = 0; linha < dados.width; linha++) {
    for (var coluna = 0; coluna < dados.height; coluna++) {
      var vermelho = 255;
      var verde = 255;
      var azul = 255;
      var alfa = 255;

      dataMatriz[linha][coluna]  = [vermelho,verde,azul,alfa];
    };
  };

  return dataMatriz;
}

Canvas.prototype.dilatacaoErosao = function(dados, matriz){
  this.dilatar(dados, matriz);

  dados = this.getPixels(this);
  matriz = this.toPixelMatriz(dados);

  this.erodir(dados, matriz);
}

Canvas.prototype.erosaoDilatacao = function(dados, matriz){
  this.erodir(dados, matriz);

  dados = this.getPixels(this);
  matriz = this.toPixelMatriz(dados);

  this.dilatar(dados, matriz);
}

Canvas.prototype.subtrairErosao = function(dados, matriz){
  this.erodir(dados, matriz);

  dados2 = this.getPixels(this);

  this.subtrair(dados, dados2);
}

Canvas.prototype.subtrair = function(dados, dados2){

  dados = this.toMatrizFromArray(dados);
  dados2 = this.toMatrizFromArray(dados2);

  console.log(dados);
  console.log(dados2);
  var matrizAux = [];

  for (var linha = 0; linha < dados.length; linha++) {
    var vetorExterno = [];
    for (var coluna = 0; coluna < dados[linha].length; coluna++) {
      var vetorDados = dados[linha][coluna];
      var vetorDados2 = dados2[linha][coluna];
      var vetorInterno = [];

      for (var k = 0; k < 4; k++) {
        if (k!=3) {
          vetorInterno.push(parseInt((vetorDados2[k]-vetorDados[k])));
        } else {
          vetorInterno.push(255);
        }
        // if (parseInt(vetorDados[k]-vetorDados2[k]) < 0) {
        //   vetorInterno.push(0);
        // } else {
        // }
      }
      vetorExterno.push(vetorInterno);
    }
    matrizAux.push(vetorExterno);
  }

  var vetorResultante = this.toArrayFromMatriz(matrizAux);
  var dadoResultante = this.toUintArray(vetorResultante);
  console.log(dadoResultante);
  this.putPixels(dadoResultante);
}
