import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Commesse } from "../models/commessa.model";

@Injectable({
  providedIn: 'root'
})

export class CommesseService {
  private baseUrl = 'http://localhost:5001/api/commesse';

  constructor(private http: HttpClient) { }

  getCommesse() {
    return this.http.get<Commesse[]>(`${this.baseUrl}/get`);
  }

  addFromJson(commessa: any) {
    return this.http.post(`${this.baseUrl}/addFromJson`, commessa,
      {
        headers: { 'Content-Type': 'application/json' }
      });
  }
  addCommessa(commessa: Commesse) {
    return this.http.post(`${this.baseUrl}/add`, commessa);
  }
  updateCommessa(commessa: Commesse) {
    return this.http.put(`${this.baseUrl}/update`, commessa);
  }
  deleteCommessa(id: number) {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }
}
