

//-------------- 加权平均插值 gdcla.js --------------
function WgNc(){

   this.DataX;    //原始点X坐标数组
   this.DataY;
   this.DataZ;

   this.NX=10;//精度，分成10份
   this.NY=10;//精度，
   this.SetN=WGSetN;            //设置精度

   this.MinX=0;            //矩形范围
   this.MaxX=0;
   this.MinY=0;            
   this.MaxY=0;
   this.SetArea=SetArea;
   
   this.coordx =new Array();        //输出点X坐标数组
   this.coordy =new Array();
   this.valueZ =new Array();        //求得要素值

   this.ExData=GDExData;        //输出目的数组

   this.r=100;            //搜索半径
   this.s    = new Array();        //搜索结果数组

   this.ExWgXY=ExWgXY;        //生成格点位置数组coordx、coordy
   this.findZ=findZ;
   

}
function SetArea(minx,maxx,miny,maxy){
   this.MinX=minx;
   this.MaxX=maxx;
   this.MinY=miny;
   this.MaxY=maxy;

}
function WGSetN(nx,ny){    //设置精度
   this.NX=nx;    
   this.NY=ny;    
}
function ExWgXY(){    // 7:55 06-8-20 修改，分为10份    

   var widthX=this.MaxX-this.MinX;    //X总长
   var dtX=widthX/this.NX;    //x段长

   var widthY=this.MaxY-this.MinY;    //Y总长
   var dtY=widthY/this.NY;    //y段长

   var fy=this.NY+1;
   var fx=this.NX+1;
   for(var i=0;i<fy;i++){
       for(var j=0;j<fx;j++){
           this.coordx[fx*i+j]=(this.MinX)+dtX*j;
           this.coordy[fx*i+j]=(this.MinY)+dtY*i;            
       }    
   }    

}
function GDExData(DataZ,DataX,DataY){        //输出目的数组
       
       this.coordx.length=0;    //生成之前先清零
       this.coordy.length=0;
       this.valueZ.length=0;

       this.DataZ=DataZ;
       this.DataX=DataX;
       this.DataY=DataY;
       
with(this){
       ExWgXY();//生成格点位置数组coordx、coordy
       r=Math.sqrt(7*((MaxX-MinX)*(MaxY-MinY)/((DataZ.length)*(Math.PI))));    //确定搜索半径
       
       var valueZlen=coordx.length;    //网格数 coordx ，不能用valueZ

       for(var i=0;i<valueZlen;i++){    //valueZ循环赋值
           var dt1=0;dt2=0;

           
           findZ(i);    //搜索比较元素
           
           
           var tmlen=s.length;
           for(var j=0;j<tmlen;j++){
               var d=(DataX[s[j]]-coordx[i])*(DataX[s[j]]-coordx[i])+(DataY[s[j]]-coordy[i])*(DataY[s[j]]-coordy[i])+0.0001; //d的平方d2=(xi-x)2+(yi-y)2                    
               dt1+=DataZ[s[j]]/d;    //d不能为0,加一微量数
               dt2+=1/d;    
           }
           valueZ[i]=dt1/dt2;

       }
       
}      
}
function findZ(valueZ){
with(this){
   
   var js=0;    //搜索结果记数
   s.length=0;
   //sjs=0;        //死循环判断
   while((js<4)||(js>9)){

       //sjs++;
       //if(sjs>(MaxX*2)) break;//如果半径或循环次数>MaxX 则退出

       var tmlen=DataZ.length;    
       for(var i=0;i<tmlen;i++){

           var d=(DataX[i]-coordx[valueZ])*(DataX[i]-coordx[valueZ])+(DataY[i]-coordy[valueZ])*(DataY[i]-coordy[valueZ]);
           d=Math.sqrt(d);        //得到两点间距离
           
           if(r>=d){        //如果在半径内
               s[js]=i;    //保存控制点位置
               js++;                
           }            
           if(js>9){        //超过范围 >9个
               js=0;
               s.length=0;    //清空数组
               r--;
               i=-1;        //标记为 r--
               break;      //跳出循环
           }
       }
       
       if((js<4)&&(i>=0)){        //对比数<4 不够    
           js=0;
           s.length=0;    //清空数组
           r++;
       }
   }        
}
   
}
//------------------ 三次B样条曲线 bsline.js----------------------------------------------
function BeLine(){


   this.N=10;//精度，每段分为10格
   this.SetN=BSSetN;            //设置精度
   
   this.coordx =new Array();;        //输出点X坐标数组
   this.coordy =new Array();

   this.ExData=ExData;        //输出目的数组


   this.DataExX =new Array();    //控制点X坐标数组
   this.DataExY =new Array();

   this.AddDataEx=AddDataEx;    //向原始点数组添加数据，生成控制点数组


}
function BSSetN(n){    //设置精度,将一段分为若干小段
   this.N=n;    
}
function AddDataEx(DataX,DataY){    //前后增加二个曲线段(两个点)

   
   var tmX=new Array();//建立临时数组扩展X坐标
   var tmY=new Array();        

   tmX[0]=2.0*DataX[0]-DataX[1];//要插入的数组开头的X坐标
   tmY[0]=2.0*DataY[0]-DataY[1];

   this.DataExX=tmX.concat(DataX);
   this.DataExY=tmY.concat(DataY);
   
   var len=(this.DataExX).length;//新的数组长度    
   
   tmX[0]=2.0*(this.DataExX[len-1])-this.DataExX[len-2];//要插入的数组结尾的X坐标
   tmY[0]=2.0*(this.DataExY[len-1])-this.DataExY[len-2];

   this.DataExX=(this.DataExX).concat(tmX);
   this.DataExY=(this.DataExY).concat(tmY);
   
}
function ExData(DataX,DataY){        //输出曲线坐标数组

      this.AddDataEx(DataX,DataY);    //原始数组前后增加两个点(加二个曲线段)
   
      var A0,A1,A2,A3;        //分段绘制曲线(X坐标轴)参数:
      var B0,B1,B2,B3;        //Y坐标轴参数:
   
      var dt=1/(this.N);            //dt分割为十份绘制光滑曲线的分割误差值        
      var IP=DataX.length-1;        //顶点数-1、曲线的段数,四个顶点确定一条曲线段.    

      with(this){        
      for(var i=0;i<IP;i++){    //IP为曲线的段数

       A0=(DataExX[i]+4.0*DataExX[i+1]+DataExX[i+2])/6.0;
       A1=-(DataExX[i]-DataExX[i+2])/2.0;
       A2=(DataExX[i]-2.0*DataExX[i+1]+DataExX[i+2])/2.0;
       A3=-(DataExX[i]-3.0*DataExX[i+1]+3.0*DataExX[i+2]-DataExX[i+3])/6.0;
       B0=(DataExY[i]+4.0*DataExY[i+1]+DataExY[i+2])/6.0;
       B1=-(DataExY[i]-DataExY[i+2])/2.0;
       B2=(DataExY[i]-2.0*DataExY[i+1]+DataExY[i+2])/2.0;
       B3=-(DataExY[i]-3.0*DataExY[i+1]+3.0*DataExY[i+2]-DataExY[i+3])/6.0;
                   
       var T1=0,T2=0,T3=0;

          for(var j=0;j<N+1;j++){    //确定一段曲线，分10小段 11个点
           T1=dt*j;     //误差
           T2=T1*T1;     //误差平方
           T3=T1*T2;     //误差立方

           coordx[i*N+j]=(A0+A1*T1+A2*T2+A3*T3);
           coordy[i*N+j]=(B0+B1*T1+B2*T2+B3*T3);
           }
      }
      }
}
//-------------------------------------- 等值线 dline.js----------------------------------------------

function qxz(){    //等值线
   this.ax=new Array();    //x坐标
   this.ay=new Array();    

   this.bx=new Array();    //光顺后x坐标
   this.by=new Array();    

   this.title="";        //值    
}

function GZ(wgnc){    //跟踪类    参数：网格目标、等值线数组

   this.coordx;    //原始点X坐标数组
   this.coordy;
   this.valueZ;

   this.NX;    //精度，分成10格
   this.NY;

   this.SetN=SetN;        //设置精度

   this.addwg =     //设置网格
		function(wgnc){
		   this.coordx =wgnc.coordx;    //原始点X坐标数组
		   this.coordy =wgnc.coordy;
		   this.valueZ =wgnc.valueZ;

		   this.NX=wgnc.NX;//精度，分成10格
		   this.NY=wgnc.NY;
		}

   this.Z=40;        //等值线 80，90，
   
   this.Dline=Dline;
   this.outDzx =     //画等值线
		function(myaz){
			with(this){
			   oa.length=0;    //生成之前先清零
			   var myazlength=myaz.length;
			   for(var i=0;i<myazlength;i++){
				   Dline(myaz[i]);
				   GetRect();
				   GetNRect();
				   
				   LineEx();
				   LineExB();
			   }    
			   var bl=new BeLine();        //曲线类
			   bl.SetN(10);
			   var oalength=oa.length;
			   for(var i=0;i<oalength;i++){    
			   
				   bl.coordx.length=0;
				   bl.coordy.length=0;
			   
				   bl.ExData(oa[i].ax,oa[i].ay);
				   var blcoordxlength=(bl.coordx).length;
				   for(var j=0;j<blcoordxlength;j++){
					   oa[i].bx[j]=bl.coordx[j];
					   oa[i].by[j]=bl.coordy[j];            
				   }

			   }        
			}    
		}

   this.up     =1;    //上行
   this.down =2;    //下行
   this.left =3;    //向左
   this.right=4;    //向右
   this.GetNext=GetNext;

   
   this.Rect = new Array();    //棱边交点数组
   this.GetRect=GetRect;    //得到棱边交点数组

   this.NRect= new Array();    //矩形内交点数组,水平
   this.GetNRect=GetNRect;    //得到矩形内交点数组    

   
   this.x=0;            //交点坐标
   this.y=0;
   this.x0=0;            //前一交点坐标    
   this.y0=0;
   this.a=0;            //线段
   this.b=0;
   
   this.sta=0;    //起点

   this.oa = new Array(); //交点组
   
   
   this.ifxj=ifxj;    //判断是否相交
   this.GetJD=GetJD;    //得到交点坐标


   this.FromN=FromN;
   this.FromS=FromS;
   this.FromW=FromW;
   this.FromE=FromE;
   this.LineEx=LineEx;
   this.LineExB=LineExB;
   this.dela=dela;
   this.determine_direction=determine_direction;    
   
}

function LineExB(){    //闭合曲线
with(this){

   
   var k=oa.length;
   var q=0;        
   var ex1=1;
   var ex2=1;


   while(NRect.length){    //分支
       

       q=0;    //因为是水平线，所以是南北边进入，但可能丢掉此闭合曲线，进入开曲线    
       ex1=1;
       
       GetJD(NRect[0],GetNext(NRect[0],right));
       
       var j=0;    //记数    
       oa[k]=new qxz();
       oa[k].ax[j]=x;    
       oa[k].ay[j]=y;
       oa[k].title=Z;
               
       j++;    
       x0=x;y0=y;

       var bjx=x;//标记x
       var bjy=y;

       a=NRect[0];
       dela(a);//删除a点
       
       var bja=a;    //标记a
       tmpa=1;
       
       while((tmpa>=0)&&(tmpa!=bja)){    //能找到下一点并且该点不是起点

           if(j>((valueZ.length)/2)){delete oa[k]; k--; (oa.length)--; break;}    //终止循环，删除该线

           switch(determine_direction(q,ex1,ex2)){               //判断进入哪个矩形
               case '北':tmpa=FromN(a);break;//得到新的坐标x,y,新的相交线段a,b    
               case '南':tmpa=FromS(a);break;    
               case '西':tmpa=FromW(a);break;    
               case '东':tmpa=FromE(a);break;    
           }
           if(tmpa<0){delete oa[k]; k--; (oa.length)--; break;};//如果找不到下一点，删除该线        
           if(tmpa!=bja){ //如果不闭合    
                       
               
               //删除a点
               dela(a);            

               //为下一步判断进入哪个矩形
               if(coordx[a]==coordx[b])q=1;    
               if(coordy[a]==coordy[b])q=0;
               ex1=x-x0;
               ex2=y-y0;
               
               x0=x;//记录前一点坐标
               y0=y;

               oa[k].ax[j]=x;    
               oa[k].ay[j]=y;
               
               j++;    //增加一点
           }
       }
       if(tmpa==bja){        //如闭合，则首尾相连
           oa[k].ax[j]=bjx;    
           oa[k].ay[j]=bjy;            
       }
       k++;    //增加一条闭合曲线
   
   }
}
}
function LineEx(){    //开曲线
with(this){

   var q=0;    
   var ex1=1;
   var ex2=1;

   
   var k=oa.length;
   var tmpb=0;    //开始点b    

   while(Rect.length){    //分支

       
       //得到q,ex1,ex2        14:34 06-8-21
       
       tmpU=GetNext(Rect[0],up);
       tmpD=GetNext(Rect[0],down);
       tmpL=GetNext(Rect[0],left);
       tmpR=GetNext(Rect[0],right);

       if(tmpU<0&&tmpR>0){    //北
           if(ifxj(Rect[0],tmpR)){
               q=0;ex2=-1;tmpb=tmpR;
           }
       }        
       if(tmpD<0){    //南
           q=0;ex2=1;tmpb=tmpR;
       }        
       if(tmpL<0&&tmpR>0){    //西
           if(ifxj(Rect[0],tmpD)){
               q=1;ex1=1;tmpb=tmpD;
           }
       }        
       if(tmpR<0){    //东
           q=1;ex1=-1;tmpb=tmpD;
       }        
       

       GetJD(Rect[0],tmpb);

       var j=0;    //记数    
       oa[k]=new qxz();
       oa[k].ax[j]=x;    
       oa[k].ay[j]=y;
       oa[k].title=Z;
       j++;
       x0=x;y0=y;
       
       a=Rect[0];
       dela(a);//删除a点
       
       tmpa=1;
       while(tmpa>=0){        //如果找到下一点            

           if(j>((valueZ.length)/2)){ delete oa[k]; k--; (oa.length)--; break;}    //终止循环并删除该线

           switch(determine_direction(q,ex1,ex2)){        //判断进入哪个矩形
               case '北':tmpa=FromN(a);break;//得到新的坐标x,y,新的相交线段a,b    
               case '南':tmpa=FromS(a);break;    
               case '西':tmpa=FromW(a);break;    
               case '东':tmpa=FromE(a);break;    
           }
           
           if(tmpa>=0){    //如果找到下一点                
               
               //删除a点
               dela(a);            
               //为下一步判断进入哪个矩形
               if(coordx[a]==coordx[b])q=1;    
               if(coordy[a]==coordy[b])q=0;
               ex1=x-x0;
               ex2=y-y0;
               
               x0=x;//记录前一点坐标
               y0=y;

               oa[k].ax[j]=x;    
               oa[k].ay[j]=y;
               
               j++;    //增加一点
           }    
       }
   k++;    //增加一条开曲线    
   }    
}
}
function dela(ia){    //删除a元素
with(this){
   var leng=Rect.length;
   for(var i=0;i<leng;i++){
       if(Rect[i]==ia){

           Rect[i]=Rect[leng-1];
           Rect.length--;    
           return 1;
       }
   }
   var leng=NRect.length;
   for(var i=0;i<leng;i++){
       if(NRect[i]==ia){
           NRect[i]=NRect[leng-1];
           NRect.length--;    
               
           return 1;
       }
   }
   return 0;
}    
}

function determine_direction(q,ex1,ex2){    //a,b,交点，前一点

   if(q==1){
       if(ex1>0){    //西
           return "西";            
       }else{        //东
           return "东";            
       }
   }else{
       if(ex2>0){    //南
           return "南";                        
       }else{        //北
           return "北";            
       }
   }
}

function FromN(ka){    //从北边进入
with(this){    
    a=ka;
    b=GetNext(a,down);    //(W)
    if(ifxj(a,b)){        //判断是否相交
       GetJD(a,b);    //得到交点坐标
       return a;    //退出
    }    

    a=b;            //(S)
    b=GetNext(a,right);
    if(ifxj(a,b)){        
       GetJD(a,b);    
       return a;    
    }    

    a=b;
    b=GetNext(a,up);    //(E)
    tmp=a;a=b;b=tmp;
    if(ifxj(a,b)){        
       GetJD(a,b);    
       return a;    
    }    
   
    return -1;
}
}
function FromS(ka){    //从南边进入
with(this){    
    a=ka;
    b=GetNext(a,up);    //(W)
    tmp=a;a=b;b=tmp;
    if(ifxj(a,b)){        
       GetJD(a,b);    
       return a;    
    }    
           
    b=GetNext(a,right);    //(N)
    if(ifxj(a,b)){        
       GetJD(a,b);    
       return a;    
    }    

    a=b;
    b=GetNext(a,down);    //(E)    
    if(ifxj(a,b)){        
       GetJD(a,b);    
       return a;    
    }    
   
    return -1;
}    
}
function FromW(ka){    //从西边进入
with(this){    
    a=ka;
    b=GetNext(a,right);    //(N)
    if(ifxj(a,b)){        
       GetJD(a,b);    
       return a;    
    }    

    a=b;            //(E)
    b=GetNext(a,down);
    if(ifxj(a,b)){        
       GetJD(a,b);    
       return a;    
    }    

    a=b;
    b=GetNext(a,left);    //(S)
    tmp=a;a=b;b=tmp;
    if(ifxj(a,b)){        
       GetJD(a,b);    
       return a;    
    }    
   
    return -1;
}    
}
function FromE(ka){    //从东边进入
with(this){    
    a=ka;
    b=GetNext(a,left);    //(N)
    tmp=a;a=b;b=tmp;
    if(ifxj(a,b)){        
       GetJD(a,b);    
       return a;    
    }    

               
    b=GetNext(a,down);    //(W)
    if(ifxj(a,b)){        
       GetJD(a,b);    
       return a;    
    }    

    a=b;
    b=GetNext(a,right);    //(S)
   
    if(ifxj(a,b)){        
       GetJD(a,b);    
       return a;    
    }    
   
    return -1;
}    
}

function GetJD(ka,kb){    //得到交点坐标

   var xa=this.coordx[ka];
   var ya=this.coordy[ka];
   var fa=this.valueZ[ka];

   var xb=this.coordx[kb];
   var yb=this.coordy[kb];
   var fb=this.valueZ[kb];

   var z=this.Z;
   
   this.x=xa+((z-fa)/(fb-fa))*(xb-xa);
   this.y=ya+((z-fa)/(fb-fa))*(yb-ya);

}
function ifxj(ka,kb){    //判断是否相交
with(this){
   if((valueZ[ka]-Z)*(valueZ[kb]-Z)<0) return 1;
   return 0;
}        
}

function GetNRect(){    //得到矩形内交点
with(this){
   var m=0;            //相交组记数
   var len=(NX+1)*(NY+1)-(NX+1);
   for(var i=NX+1;i<len;i+=NX+1){
       for(var j=i;j<i+NX;j++){
           if(ifxj(j,j+1)){
               NRect[m]=j;
               m++;
           }
       }        
   }    
}
}

function GetRect(){    //得到矩形边交点    
with(this){


   var j=0;                //相交组记数
   var ka=0;                //南边->
   var kb=1;    
   while(kb>=0){                
       if(ifxj(ka,kb)){
           Rect[j]=ka;
           j++;
       }
       ka=kb;
       kb=GetNext(ka,right);    
   }
   
   kb=GetNext(ka,up);            //东边
   while(kb>=0){                
       if(ifxj(ka,kb)){
           Rect[j]=kb;
           j++;
       }
       ka=kb;
       kb=GetNext(ka,up);    
   }

   ka=0;                    //西边
   kb=GetNext(ka,up);            
   while(kb>=0){                
       if(ifxj(ka,kb)){
           Rect[j]=kb;
           j++;
       }
       ka=kb;
       kb=GetNext(ka,up);    
   }

   kb=GetNext(ka,right);            //北边
   while(kb>=0){                
       if(ifxj(ka,kb)){
           Rect[j]=ka;
           j++;
       }
       ka=kb;
       kb=GetNext(ka,right);    
   }
}
}

function GetNext(i,fd){        //根据下标查找
with(this){
   var j=0;
   if(fd==down){
       j=i-(NX+1);        //下
       if(j<0)j=-1;        //终止条件
   }
   if(fd==up){
       j=i+(NX+1);        //上
       if(j>(NX+1)*(NY+1)-1)j=-1;        
   }
   if(fd==left){
       if(i%(NX+1)==0)j=-1;
       else j=i-1;        //左
       
   }
   if(fd==right){
       j=i+1;            //右
       if(j%(NX+1)==0)j=-1;
   }
   return j;
}
}

function SetN(nx,ny){    //设置精度
   this.NX=nx;    
   this.NY=ny;    
}
function Dline(z){    //等值线
with(this){
   this.Z=z;
   var leng=valueZ.length;
   for(var i=0;i<leng;i++){
       if(valueZ[i]==z)valueZ[i]=z+0.00001;
   }
}
}
//---------------------------------------------等直线结束 ---------------------------------------------

function    WeatherChart(DAViewer){    //图表类 绘图环境

   this.DAViewer=DAViewer;
   this.lib = DAViewer.PcoordxelLibrary;  
   //得到DAStatics Class

   this.face= this.lib.NewDrawingSurface();
   //得到DADrawingSurface Class
   
   this.faceTs= this.lib.NewDrawingSurface();

   this.run=run;
}
function run(){

   var TsImg=this.faceTs.Image;
   TsImg=TsImg.Opacity(0.2);
   TsImg=TsImg.Transform(this.lib.Translate2(-(parseInt(DAViewer.style.width)/2),-parseInt(DAViewer.style.height)/2));
   
   var LineImg=this.face.Image;
   LineImg=LineImg.Transform(this.lib.Translate2(-(parseInt(DAViewer.style.width)/2),-parseInt(DAViewer.style.height)/2));

   //var DtImg=this.lib.ImportImage("dt.gif");//天气底图，透明
   //var aImg= new Array(LineImg,DtImg,TsImg);

   var aImg= new Array(LineImg,TsImg);

   this.DAViewer.Image=this.lib.OverlayArray(aImg);

   this.DAViewer.Start();
   

}
//------------------------------------------------------------------------------------


window.top.moveTo(0,0);


//要素值
var CityName=new Array(231,230,264,249,251,240,218,265,255,209,258,279,266,288,251,225,311,277,297,257,305,313,222,290,284,273,225,208,277,298,247,314,220,286,315,217,305,210,234,219,287,270,294,237,199,287,264);
//要素点x坐标
var CityX=new Array(427.1,626.08,710.22,445.93,496.5,555.28,379.54,583.91,281.1,459.36,340.56,777.05,263.13,192.39,255.38,272.84,145.16,375.63,282.73,360.69,202.39,107.08,360.02,339.91,636.87,771.85,550.74,446,401.62,666.07,550.48,90.34,446.69,369.49,72.55,497.91,240.52,346.1,485.87,398.34,683.04,737.72,234.96,633.38,376.5,290.07,422.73);
//要素点y坐标
var CityY=new Array(449.84,415.18,363.8,483.75,444.46,419.27,503.27,491.52,356.76,233.58,243.3,285.6,329.76,289.38,485.02,456.18,207.84,117.17,135.77,180.28,156.02,126.3,313.84,114.55,157.37,210.49,268.8,204.53,80.76,102.95,526.19,349.25,323.51,27.23,212.45,284.2,49.96,403.58,400.88,287.23,34.26,299.52,239.37,434.4,377.03,77.56,112.32);

var MaxZ=315;
var MinZ=199;
var myaz=new Array(220,230,240,250,260,270,280,290,300,310);//等值线值    

//---------------------------------------------
var mywg= new WgNc(); //生成网格目标

mywg.SetArea(20,780,20,530);//设置网格，最小x坐标，最大x坐标，最小y坐标，最大y坐标

mywg.SetN(25,20);//设置格距 宽/25 高/20

mywg.ExData(CityName,CityX,CityY);    //网格化

var MyLine = new GZ();//生成等值线对象

MyLine.addwg(mywg);//加网格

MyLine.outDzx(myaz);//输出等值线

//---------------------------------------------

var myg=new WeatherChart(DAViewer);//生成气象图表对象

//--------------- 添色斑 --------------------
myg.faceTs.BorderDashStyle(0);
var wgk=(mywg.MaxX-mywg.MinX)/(mywg.NX)+1;
var wgg=(mywg.MaxY-mywg.MinY)/(mywg.NY)+1;

var cdt=0.5/(MaxZ-MinZ+0.0001);

for(var i=0;i<(mywg.valueZ).length;i++){

   var tmp=0.5-(mywg.valueZ[i]-MinZ)*cdt;
   myg.faceTs.FillColor(myg.lib.ColorHsl(tmp,1.0,1.0/2+0.1));
   myg.faceTs.Rect(mywg.coordx[i]-wgk/2,mywg.coordy[i]-wgg/2,wgk,wgg);    
}
//-------------- 添要素值----------------------
var fontsvalueZe=10;
myg.face.Font("楷体_GB2312",fontsvalueZe,0,0,0,0);
myg.face.BorderDashStyle(0);
myg.face.FillColor(myg.lib.blue);
var DZlength=CityName.length;
for(var i=0;i<DZlength;i++){    //城市要素
   var zl=CityName[i]/10;
   if(parseInt(zl,10)==zl) zl=zl+".0";
   else zl=zl+"";
   var zlen=zl.length;
   myg.face.Text(zl,CityX[i]-(zlen*fontsvalueZe)/4-zlen,CityY[i]+fontsvalueZe+6-1);
}
//------------ 画等值线 ------------------------
var dtdj=40;    
myg.face.LineColor(myg.lib.ColorRgb255(255,0,0));    
myg.face.LineWidth(1);    
with(MyLine){
var oalength=oa.length;
var k=1;
for(var i=0;i<oalength;i++){
   var oabxlength=(oa[i].bx).length-1;
   
   for(var j=0;j<oabxlength;j++){
       if((k*dtdj)>(oa[i].bx.length-1)) k=1;
       if((j<(k*dtdj-4))||(j>(k*dtdj+3)))    
       myg.face.Line(oa[i].bx[j],oa[i].by[j],oa[i].bx[j+1],oa[i].by[j+1]);            
   }
   k++;
}
}
var fontszie=12;
myg.face.BorderDashStyle(0);
myg.face.Font("楷体_GB2312",fontszie,0,0,0,0);
myg.face.FillColor(myg.lib.ColorRgb255(255,0,0));    
var oalength=(MyLine.oa).length;    
var j=1;

for(var i=0;i<oalength;i++){

   var zl=(MyLine.oa[i].title)/10;
   if(parseInt(zl,10)==zl) zl=zl+".0";
   else zl=zl+"";
   var zlen=zl.length;

   if((j*dtdj)>(MyLine.oa[i].bx.length-1))j=1;
   myg.face.Text(zl,MyLine.oa[i].bx[j*dtdj]-fontszie*zlen/4,MyLine.oa[i].by[j*dtdj]+fontszie/2);    
   j++;
}

//---------------------------------------
myg.face.BorderDashStyle(0);
myg.face.FillColor(myg.lib.white);
myg.face.Rect(0,0,20,550);
myg.face.Rect(0,0,800,20);
myg.face.Rect(800-20+1,20,20,550);
myg.face.Rect(0,550-20+1,800,20);

myg.run();
window.resvalueZeTo(850,600);
wait.style.display="none";