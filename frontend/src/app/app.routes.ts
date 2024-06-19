import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DebuggerComponent } from './debugger/debugger.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { RepositoryComponent } from './repository/repository.component';
import { HistoryComponent } from './debugger/history/history.component';
import { CodeDetailComponent } from './debugger/history/code-detail/code-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'repository', component: RepositoryComponent },
  { path: 'debugger', component: DebuggerComponent },
  { path: 'signup', component: SignupComponent},
  { path: 'login', component: LoginComponent},
  { path: 'history', component: HistoryComponent },
  { path: 'code-detail/:id', component: CodeDetailComponent }
];
