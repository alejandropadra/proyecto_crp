"""empty message

Revision ID: 9b5e43fc72d5
Revises: 5b6b9b04a677
Create Date: 2023-08-08 08:53:11.701109

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9b5e43fc72d5'
down_revision = '5b6b9b04a677'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('seller', sa.String(length=10), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('users', 'seller')
    # ### end Alembic commands ###
