class Stack<T> {
   protected data: Array<T>;

   constructor() {
       this.data = [];
   }

   public push(ele: T) {
       this.data.push(ele);
   }

   public pop() {
       return this.data.pop();
   }

   public clear() {
       this.data = [];
   }

   public isEmpty() {
       return !!this.data.length;
   }
}
