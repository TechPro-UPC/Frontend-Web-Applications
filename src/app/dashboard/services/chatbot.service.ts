import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ChatMessage } from '../models/chat-message.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private baseUrl = 'https://generativelanguage.googleapis.com/v1/models';

  constructor(private http: HttpClient) {}

  sendConversation(messages: ChatMessage[]): Observable<string> {
    const url = `${this.baseUrl}/${environment.aiModel}:generateContent`;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text:
              'Eres un asistente virtual amable que ayuda a estudiantes con dudas generales sobre la universidad, cursos y vida académica. Responde en español de forma clara y breve.'
          }
        ]
      },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    ];

    const body = { contents };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-goog-api-key': environment.aiApiKey
    });

    return this.http.post<any>(url, body, { headers }).pipe(
      map(response => {
        const text =
          response?.candidates?.[0]?.content?.parts?.[0]?.text ??
          'Lo siento, hubo un problema al responder.';
        return text;
      })
    );
  }
}
