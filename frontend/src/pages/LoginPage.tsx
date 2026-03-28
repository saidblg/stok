import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '../utils/validation';
import { LoginCredentials } from '../types';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LoginPage = () => {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    await login(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">KARABACAK GIDA</h2>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Stok ve Müşteri Takip
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="E-posta"
            type="email"
            placeholder="ornek@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Şifre"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" fullWidth loading={isSubmitting}>
            Giriş Yap
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
